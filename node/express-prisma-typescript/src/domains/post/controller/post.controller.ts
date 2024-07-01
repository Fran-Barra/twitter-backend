import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
//TODO: express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { BodyValidation } from '@utils'

import { CreatePostInputDTO } from '../dto'
import { service } from '../resources'
import { commentRouter } from './comment.controller'

export const postRouter = Router()
postRouter.use("/comment", commentRouter)

/**
 * @swagger
 * /api/post/:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: get the user posts
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
postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /api/post/{postId}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: Get a specific post
 *    parameters:
 *      - name: postId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: ID of the post to retrieve
 *    responses:
 *      '200':
 *        description: The post that was requested
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PostDTO'
 *      '404':
 *        description: The post was not found or the author is private and the user does not follow them
 */
postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
})

/**
 * @swagger
 * /api/post/by_user/{userId}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: Get all posts of a user
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        description: The ID of the user whose posts are to be retrieved
 *        schema:
 *          type: string
 *          example: "bff5b48a-73e9-41e1-b9a2-2d1ae5066989"
 *    responses:
 *      200:
 *        description: A list of posts of the user, may be empty
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ExtendedPostDTO'
 *      404:
 *        description: The author is private and user does not follow them or does not exist
 */
postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})


/**
 * @swagger
 * /api/post/:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: Publish a new post as the author
 *    requestBody:
 *      description: The information of the post to create
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreatePostInputDTO'
 *    responses:
 *      200:
 *        description: The created post
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PostDTO'
 *      400:
 *        description: Something was wrong with the body
 */
postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

/**
 * @swagger
 * /api/post/{postId}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    tags:
 *      - post
 *    summary: delete a specific post
 *    responses:
 *      200:
 *        description: the post that was deleted
 *        content:
 *          type:
 *            '#/components/schemas/PostDTO'
 *      404:
 *        description: the post was not found
 *      403:
 *        description: you must be the author to delete a post
 */
postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})
