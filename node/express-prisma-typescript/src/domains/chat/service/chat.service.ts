import { CursorPagination } from "@types"
import { ChatDTO, MessageDTO } from "../dto"

export interface ChatService {
    createChat: (ownerId: string, chatName: string, participantsId: string[]) => Promise<ChatDTO>
    getChatsWhereUserIsParticipantOrOwner: (userId: string, pagination: CursorPagination) => Promise<ChatDTO[]>
    closeChat: (ownerId: string, chatId: string) => Promise<void>

    addParticipant: (ownerId: string, chatId: string, participantId: string) => Promise<void>
    removeParticipant: (ownerId: string, chatId: string, participantId: string) => Promise<void>
    isParticipantOrOwner: (chatId: string, participantId: string) => Promise<boolean>

    sendMessage: (userId: string, chatId: string, message: string) => Promise<MessageDTO>
    getChatMessages: (userId: string, chatId: string, options: CursorPagination) => Promise<MessageDTO[]>
}