import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
//TODO: express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'

import { CreatePostInputDTO } from '../dto'
import { service } from '../resources'

export const postRouter = Router()


/**
 * @swagger
 * /api/post/:
 *  get:
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
 *    tags:
 *      - post
 *    summary: get an specific post
 *    responses:
 *      200:
 *        description: the post that was asked for
 *        content:
 *          type:
 *            '#/components/schemas/PostDTO'
 *      404:
 *        description: the post was not found or the author is private and user does not follow it
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
 *    responses:
 *      200:
 *        description: A list of posts of the user, may be empty
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/PostDTO'
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
