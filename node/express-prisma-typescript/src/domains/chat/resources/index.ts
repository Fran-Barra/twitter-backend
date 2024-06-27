import { db } from "@utils";
import { ChatRepositoryImpl } from "../repository/chat.repository.impl";
import { ChatServiceImpl } from "../service/chat.service.impl";
import followService from "@domains/follower/resource";
import { ChatService } from "../service/chat.service";

export const chatService : ChatService = new ChatServiceImpl(new ChatRepositoryImpl(db), followService)