import { db } from "@utils";
import { ChatRepositoryImpl } from "../repository/chat.repository.impl";
import { ChatServiceImpl } from "../service/chat.service.impl";
import followService from "@domains/follower/resource";
import { ChatService } from "../service/chat.service";
import { ChatRepository } from "../repository/chat.repository";
import { UsersFollowEachOtherAndChatParticipants } from "@domains/auth/service";

const chatRepository : ChatRepository = new ChatRepositoryImpl(db)
export const chatService : ChatService = new ChatServiceImpl(
    new ChatRepositoryImpl(db), 
    new UsersFollowEachOtherAndChatParticipants(followService, chatRepository)
)