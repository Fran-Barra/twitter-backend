import { CursorPagination } from "@types"
import { ChatDTO, MessageDTO } from "../dto"

export interface ChatRepository {
    createChat: (ownerId: string, name: string, participantsId: string[]) => Promise<ChatDTO>
    getChat: (chatId: string) => Promise<ChatDTO | null>
    getChatsWhereUserIsParticipantOrOwner: (userId: string, pagination: CursorPagination) => Promise<ChatDTO[]>
    deleteChat: (chatId: string) => Promise<void>

    addParticipant: (chatId: string, userId: string) => Promise<void>
    removeParticipant: (chatId: string, userId: string) => Promise<void>

    addMessage: (chatId: string, userId: string, message: string) => Promise<MessageDTO>
    getChatMessages: (chatId: string, options: CursorPagination) => Promise<MessageDTO[]>

    quitFromShearedChats: (followerId: string, followedId: string) => Promise<void>
}