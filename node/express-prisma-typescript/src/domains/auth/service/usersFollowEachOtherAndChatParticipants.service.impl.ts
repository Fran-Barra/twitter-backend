import { ChatRepository } from "@domains/chat/repository/chat.repository";
import { FollowsAndUpdatesService, OnStoppedFollowingObserver } from "@domains/follower";
import { ForbiddenException, NotFoundException } from "@utils";
import { AuthToAddParticipantInChat } from "./authToAddParticipantInChat.service";

export class UsersFollowEachOtherAndChatParticipants implements AuthToAddParticipantInChat, OnStoppedFollowingObserver {
    constructor(
        private readonly followService : FollowsAndUpdatesService,
        private readonly chatRepository : ChatRepository
    ) {
        followService.subscribeToOnStoppedFollowing(this)
    }

    authorizeManyAtCreation(userAddingParticipantsId: string, newParticipantsIds: string[]) : Promise<boolean> {
        newParticipantsIds.push(userAddingParticipantsId)
        return this.followService.allUsersFollowEachOther(newParticipantsIds)
    }

    async authorizeOne(userAddingParticipantId: string, chatId: string, newParticipantId: string) : Promise<boolean> {
        const chat = await this.chatRepository.getChat(chatId)
        if (!chat) throw new NotFoundException('chat')
        
        if (chat.owner.id !== userAddingParticipantId) throw new ForbiddenException()
        
        const participantsIds = chat.participants.map(p=>p.id)
        participantsIds.push(userAddingParticipantId)
        participantsIds.push(newParticipantId)
        return this.followService.allUsersFollowEachOther(participantsIds)
    }

    async onStoppedFollowingAction(followerId: string, followedId: string) : Promise<void> {
        await this.chatRepository.quitFromShearedChats(followerId, followedId)   
    }
}