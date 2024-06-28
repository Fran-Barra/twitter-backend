import { BodyValidation } from "@utils";
import { Request, Response, Router } from "express";
import { CreateChatDTO, ParticipantDTO } from "../dto";
import { chatService } from "../resources";
import httpStatus from "http-status";


export const chatRouter = Router()

/**
 * @swagger
 * /api/chat/:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - chat
 *    summary: create a new chat
 *    requestBody:
 *      description: The information of the chat to create
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateChatDTO'
 *    responses:
 *      200:
 *        description: The created chat
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChatDTO'
 *      400:
 *        description: Something was wrong with the body
 */
chatRouter.post('/', BodyValidation(CreateChatDTO), async (req: Request, res: Response) => {
    const {userId : ownerId } = res.locals.context
    console.log("passed validation: " + req.body);
    
    const dto : CreateChatDTO = req.body
    const chat = await chatService.createChat(ownerId, dto.name, dto.participantIds || Array<string>())
    return res.status(httpStatus.CREATED).json(chat)
})

/**
 * @swagger
 * /api/chat/:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - chat
 *    summary: return the chats where the user is owner or participant
 *    responses:
 *      200:
 *        description: the list was generated successfully, may be empty
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  $ref: '#/components/schemas/ChatDTO'
 */
chatRouter.get('/', async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { limit, before, after } = req.query as Record<string, string>
    const chats = await chatService.getChatsWhereUserIsParticipantOrOwner(userId, {limit: Number(limit), before, after})
    return res.status(httpStatus.OK).json(chats)
})

/**
 * @swagger
 * /api/chat/participants/{chatId}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - chat
 *    summary: add a participant to the chat
 *    parameters:
 *      - in: path
 *        name: chatId
 *        required: true
 *        description: The ID of the chat to add the user
 *        schema:
 *          type: string
 *    requestBody:
 *      description: The participant id
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ParticipantDTO'
 *    responses:
 *      200:
 *        description: The user was added
 *      400:
 *        description: Something was wrong with the body
 *      403:
 *        description: Must be the owner of the chat
 */
chatRouter.post('/participants/:chatId', BodyValidation(ParticipantDTO), async (req: Request, res: Response) => {
    const { userId : ownerId } = res.locals.context
    const { chatId } = req.params
    console.log(req.body);
    
    const dto : ParticipantDTO = req.body
    await chatService.addParticipant(ownerId, chatId, dto.participantId)
    return res.status(httpStatus.OK).send()
})

/**
 * @swagger
 * /api/chat/participants/{chatId}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - chat
 *    summary: remove a participant of the chat
 *    parameters:
 *      - in: path
 *        name: chatId
 *        required: true
 *        description: The ID of the chat to remove the user
 *        schema:
 *          type: string
 *    requestBody:
 *      description: The participant id
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ParticipantDTO'
 *    responses:
 *      200:
 *        description: The user was added
 *      400:
 *        description: Something was wrong with the body
 *      403:
 *        description: Must be the owner of the chat
 */
chatRouter.delete('/participants/:chatId', BodyValidation(ParticipantDTO), async (req: Request, res: Response) => {
    const { userId : ownerId } = res.locals.context
    const { chatId } = req.params
    const dto : ParticipantDTO = req.body
    await chatService.removeParticipant(ownerId, chatId, dto.participantId)
    return res.status(httpStatus.OK).send()
})

/**
 * @swagger
 * /api/chat/{chatId}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - chat
 *    summary: delete a specific chat
 *    responses:
 *      200:
 *        description: the chat was deleted
 *      404:
 *        description: the chat was not found
 *      403:
 *        description: you must be the owner to delete the chat
 */
chatRouter.delete('/:chatId', async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { chatId } = req.params

    await chatService.closeChat(userId, chatId)
    return res.status(httpStatus.OK).send()
})