import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { imageService } from '@domains/image'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db), imageService)

//TODO: might be missing post user


/**
 * @swagger
 * /api/user/:
 *  get:
 *    tags:
 *      - user
 *    summary: get the user recommendations
 *    responses:
 *      200:
 *        description: a list of users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/UserViewDTO'
 */
userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})


/**
 * @swagger
 * /api/user/:
 *  get:
 *    tags:
 *      - user
 *    summary: get the information of the logged user
 *    responses:
 *      200:
 *        description: the user information
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserViewDTO'
 */
userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @swagger
 * /api/user/{userId}:
 *  get:
 *    tags:
 *      - user
 *    summary: get the information of the user
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        description: The ID of the user whose information to be retrieved
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: the user information
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserViewDTO'
 *      404:
 *        description: the user with that id was not found
 */
userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})


/**
 * @swagger
 * /api/user/:
 *  delete:
 *    tags:
 *      - user
 *    summary: delete the user
 *    responses:
 *      200:
 *        description: the user was deleted
 */
userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})


/**
 * @swagger
 * /api/user/profile-picture:
 *  post:
 *    tags:
 *      - user
 *    summary: get url for user profile picture
 *    responses:
 *      200:
 *        description: the url for the profile picture
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                post-url: string
 */
userRouter.post('/profile-picture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const url = await imageService.getSignedUrlForProfilePictureForPut(userId)

  return res.status(HttpStatus.OK).json({"post-url":url})
})