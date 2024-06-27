import { ForbiddenException, NotFoundException } from "@utils";
import { ChatDTO, MessageDTO } from "../dto";
import { ChatRepository } from "../repository/chat.repository";
import { ChatService } from "./chat.service";
import { FollowsAndUpdatesService, OnStoppedFollowingObserver } from "@domains/follower";
import { CursorPagination } from "@types";


//TODO: imported the other repository by accident, don't make it public
export class ChatServiceImpl implements ChatService, OnStoppedFollowingObserver{
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly followsUser: FollowsAndUpdatesService
    ) {
        followsUser.subscribeToOnStoppedFollowing(this)
    }

    async createChat(ownerId: string, chatName: string, participantsId: string[]) : Promise<ChatDTO> {
        if (!await this.followsUser.userFollowsAll(ownerId, participantsId)) 
            throw new ForbiddenException()
        return this.chatRepository.createChat(ownerId, chatName, participantsId)
    }

    getChatsWhereUserIsParticipantOrOwner(userId: string, pagination: CursorPagination) : Promise<ChatDTO[]> {
        return this.chatRepository.getChatsWhereUserIsParticipantOrOwner(userId, pagination)
    }


    async closeChat(ownerId: string, chatId: string) : Promise<void> {
        if (await this.isOwner(ownerId, chatId)) throw new ForbiddenException()

        this.chatRepository.deleteChat(chatId)
    }

    async addParticipant(ownerId: string, chatId: string, participantId: string) : Promise<void> {
        if (!await this.followsUser.userFollows(ownerId, participantId)) new ForbiddenException()
        if (await this.isOwner(ownerId, chatId)) new ForbiddenException()

        this.chatRepository.addParticipant(chatId, participantId)
    }

    async removeParticipant(ownerId: string, chatId: string, participantId: string) : Promise<void> {
        if (await this.isOwner(ownerId, chatId)) new ForbiddenException()

        this.chatRepository.removeParticipant(chatId, participantId)
    }

    //TODO: this could be in repository, should i hash results to make it faster? 
    //since they are real time this will repeat several times
    async isParticipantOrOwner(userId: string, chatId: string) : Promise<boolean> {
        const chat = await this.chatRepository.getChat(chatId)
        if (chat === null) throw new NotFoundException('chat')
            
        if (chat.owner.id === userId) return true
        for (const participant of chat.participants) {
            if (participant.id === userId) return true
        }
        return false
    }

    async sendMessage(userId: string, chatId: string, message: string) : Promise<MessageDTO> {
        if (!await this.isParticipantOrOwner(userId, chatId)) new ForbiddenException()
        return this.chatRepository.addMessage(chatId, userId, message)
    }

    async getChatMessages(userId: string, chatId: string, options: CursorPagination) : Promise<MessageDTO[]> {
        if (!await this.isParticipantOrOwner(userId, chatId)) new ForbiddenException()
        return this.chatRepository.getChatMessages(chatId, options)
    }


    private async isOwner(ownerId: string, chatId: string) : Promise<boolean> {
        const chat = await this.chatRepository.getChat(chatId)
        if (chat === null) throw new NotFoundException('chat')
        return chat.owner.id === ownerId
    }

    async onStoppedFollowingAction(followerId: string, followedId: string) : Promise<void> {
        await this.chatRepository.quitFromShearedChats(followerId, followedId)   
    }
}