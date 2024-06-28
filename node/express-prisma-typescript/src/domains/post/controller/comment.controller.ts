import { Request, Response, Router } from "express";
import { BodyValidation } from "@utils/validation";
import { CreatePostInputDTO } from "../dto";
import { service } from '../resources'
import httpStatus from "http-status";
import 'express-async-errors'


export const commentRouter = Router()


/**
 * @swagger
 * /api/post/comment/{postId}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: comment a post
 *    parameters:
 *      - in: path
 *        name: postId
 *        required: true
 *        description: The ID of the post to be commented
 *        schema:
 *          type: string
 *    requestBody:
 *      description: The information of the post to create
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreatePostInputDTO'
 *    responses:
 *      200:
 *        description: the postDTO of the comment
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/PostDTO'
 *      404:
 *        description: The author is private and user does not follow them or does not exist
 */
commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { postId } = req.params
    const data = req.body

    const comment = await service.createComment(userId, postId, data)

    return res.status(httpStatus.OK).json(comment)
})

/**
 * @swagger
 * /api/post/comment/{postId}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: get the comments from post
 *    responses:
 *      200:
 *        description: a list of posts, may be empty
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ExtendedPostDTO'
 */
commentRouter.get('/:postId', async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { postId } = req.params
    const { limit, before, after } = req.query as Record<string, string>

    const comments = await service.getCommentsFromPost(userId, postId, {limit: Number(limit), before, after})

    return res.status(httpStatus.OK).json(comments)
})