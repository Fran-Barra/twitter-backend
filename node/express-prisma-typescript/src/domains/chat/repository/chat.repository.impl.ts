import { Chat, PrismaClient, User, UserOnChat } from "@prisma/client";
import { ChatRepository } from "./chat.repository";
import { CursorPagination } from "@types";
import { ChatDTO, MessageDTO } from "../dto";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime";
import { ValidationException } from "@utils";

//TODO: consider making another query and DTO for chat participants
export class ChatRepositoryImpl implements ChatRepository{
    constructor(private readonly db: PrismaClient) {}

    async createChat(ownerId: string, name: string, participantsId: string[]) : Promise<ChatDTO> {
        console.log("owner id:" + ownerId);
        
        const chat = await this.db.chat.create({
            data: {
                ownerId: ownerId,
                name: name,
                participants: {
                    create: participantsId.map(pId => ({user: {connect: {id: pId}}}))
                }
            },
            include: {
                owner: true,
                participants: {
                    include: {
                        user: true
                    }
                }
            }
        })
        return this.mapChatToChatDTO(chat)
    }

    async getChat(chatId: string) : Promise<ChatDTO | null> {
        console.log("chat id: " +chatId);
        
        try {
        
        const chat = await this.db.chat.findFirst({
            where: {id: chatId, deletedAt: null},
            include: {
                owner: true,
                participants: {
                    include: {
                        user: true
                    }
                }
            }
        })
        
        if (!chat) return null        
        return this.mapChatToChatDTO(chat)
        } catch (err) {
            //TODO: should validate the uuid with a decorator
            if (err instanceof PrismaClientKnownRequestError)
                if (err.code === "P2023" && err.message.includes("Error creating UUID"))
                    throw new ValidationException([new String("invalid uuid")])
            throw err
        }   
    }

    //TODO: if extra time, sort by last message
    async getChatsWhereUserIsParticipantOrOwner(userId: string, options: CursorPagination) : Promise<ChatDTO[]> {
        return (await this.db.chat.findMany({
            where: {
                OR: [
                    {
                        ownerId: userId
                    },
                    {
                        participants: {
                            some: {
                                userId: userId
                            }
                        }
                    }
                ],
                deletedAt: null
            },
            cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            include: {
                owner: true,
                participants: {
                    include: {
                        user: true
                    }
                }
            }
        })).map(this.mapChatToChatDTO)
    }


    async deleteChat(chatId: string) : Promise<void> {
        await this.db.chat.update({where: {id: chatId}, data: {deletedAt: new Date()}})
    }

    async addParticipant(chatId: string, userId: string) : Promise<void> {
        try {
        await this.db.userOnChat.create({
            data: {
                chatId: chatId,
                userId: userId
            }
        })
        } catch(err) {
            if (err !instanceof PrismaClientKnownRequestError) {
                if (err.message.includes("unique_chat_user") && err.code === "P2002") 
                    return
            }
            throw err
        }
    }

    async removeParticipant(chatId: string, userId: string) : Promise<void> {
        await this.db.userOnChat.delete({
            where: {
                unique_chat_user: {
                    chatId: chatId,
                    userId: userId
                }
            }
        })
    }

    //TODO: should encrypt the messages
    async addMessage(chatId: string, userId: string, message: string) : Promise<MessageDTO> {
        return await this.db.chatMessage.create({
            data: {
                chatId: chatId,
                userId: userId,
                message: message
            }
        })
    }

    //TODO: should decrypt messages
    getChatMessages(chatId: string, options: CursorPagination) : Promise<MessageDTO[]> {
        return this.db.chatMessage.findMany({
            where: {
                chatId: chatId
            },
            cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    async quitFromShearedChats(followerId: string, followedId: string) : Promise<void> {
        await this.db.userOnChat.deleteMany({
            where: {
                OR: [
                    {
                        userId: followerId,
                        chat: {
                            participants: {
                                some: {
                                    userId: followedId
                                }
                            }
                        }
                    },
                    {
                        chat: {
                            ownerId: followerId,
                        },
                        userId: followedId
                    }
                ]
            }
        })
    }

    private mapChatToChatDTO(chat: Chat & { owner: User; participants: (UserOnChat & { user: User; })[]; }) : ChatDTO {
        return {
            id: chat.id,
            name: chat.name,
            owner: chat.owner,
            participants: chat.participants.map(p => p.user)
        }
    }
}