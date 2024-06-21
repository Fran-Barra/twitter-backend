import { Request, Response, Router } from "express";
import { postRouter } from "./post.controller";
import { BodyValidation } from "@utils/validation";
import { CreatePostInputDTO } from "../dto";
import { service } from '../resources'
import httpStatus from "http-status";
import 'express-async-errors'


const commentRouter = Router()
postRouter.use('/comment', commentRouter)


/**
 * @swagger
 * /api/post/comment/{postId}:
 *  get:
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
postRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { postId } = req.params
    const data = req.body

    const comment = service.createComment(userId, postId, data)

    return res.status(httpStatus.OK).json(comment)
})

/**
 * @swagger
 * /api/post/comment/{postId}:
 *  get:
 *    tags:
 *      - post
 *    summary: get the comments of the user
 *    responses:
 *      200:
 *        description: a list of posts, may be empty
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/PostDTO'
 */
postRouter.get('/:postId', async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { postId } = req.params
    const { limit, before, after } = req.query as Record<string, string>

    const comments = service.getCommentsFromPost(userId, postId, {limit: Number(limit), before, after})

    return res.status(httpStatus.OK).json(comments)
})