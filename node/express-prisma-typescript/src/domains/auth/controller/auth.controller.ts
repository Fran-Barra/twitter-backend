import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

export const authRouter = Router()

// Use dependency injection
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))


/**
 * @swagger
 * /api/auth/signup/:
 *  post:
 *    tags:
 *      - auth
 *    summary: create a new user and generate a token
 *    requestBody:
 *      description: The information of the user create
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SignupInputDTO'
 *    responses:
 *      200:
 *        description: The user was created and logged successfully
 *        content:
 *          type: string
 *      409:
 *        description: the user already exists
 */
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.signup(data)

  return res.status(HttpStatus.CREATED).json(token)
})


/**
 * @swagger
 * /api/auth/login/:
 *  post:
 *    tags:
 *      - auth
 *    summary: Log in with user credentials
 *    requestBody:
 *      description: The information of the user to log in
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginInputDTO'
 *    responses:
 *      200:
 *        description: The user logged in successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: The JWT token
 *      401:
 *        description: Password or email were wrong
 */
authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.login(data)

  return res.status(HttpStatus.OK).json(token)
})
