import { UserDTO } from "@domains/user/dto"
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator"


/**
 * @swagger
 * components:
 *  schemas:
 *    CreateChatDTO:
 *      tags:
 *        - chat
 *      properties:
 *        name:
 *          type: string
 *          description: the name of the chat
 *        participantIds:
 *          type: array
 *          items:
 *            type: string
 *          description: the user ids for the chat, is optional
 */
export class CreateChatDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    name!: string

    @IsOptional()
    @IsArray()
    @IsNotEmpty()
    @IsString({each: true})
    participantIds?: string[]
}

/**
* @swagger
* components:
*  schemas:
*    ParticipantDTO:
*      tags:
*        - chat
*      properties:
*        participantId:
*          type: string
*          description: the id of the user
*/
export class ParticipantDTO {
    @IsString()
    @IsNotEmpty()
    participantId!: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    ChatDTO:
 *      tags:
 *        - chat
 *      properties:
 *        id:
 *          type: string
 *          description: the id of the chat
 *        name:
 *          type: string
 *          description: the name of the chat
 *        owner:
 *          type: '#/components/schemas/UserDTO'
 *        participants:
 *          type: array
 *          items:
 *            type: '#/components/schemas/UserDTO'
 *          description: the users participating in the chat
 */
export interface ChatDTO {
    id: String
    name: String
    owner: UserDTO
    //TODO: take care here, might be to many users
    participants: UserDTO[]
}

/**
* @swagger
* components:
*  schemas:
*    MessageDTO:
*      tags:
*        - chat
*      properties:
*        userId:
*          type: string
*          description: the id of the user
*        createdAt:
*           type: date
*           description: the moment the message was created
*        message:
*           type: string
*           description: the content of the message
*/
export interface MessageDTO {
    userId: string
    createdAt: Date
    message: string
}