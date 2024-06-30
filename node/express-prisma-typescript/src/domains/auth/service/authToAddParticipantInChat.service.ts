
export interface AuthToAddParticipantInChat {
    authorizeManyAtCreation: (userAddingParticipantsId: string, newParticipantsIds: string[]) => Promise<boolean>
    authorizeOne: (userAddingParticipantId: string, chatId: string, newParticipantId: string) => Promise<boolean>
}