import { Request, Response, Router } from "express";
import { FollowRepository } from "../repository/follow.repository";
import { FollowRepositoryImpl } from "../repository/follow.repository.impl";
import { db } from "@utils";
import httpStatus from "http-status";


export const followRouter: Router = Router()

//dependencies
const followRepository: FollowRepository = new FollowRepositoryImpl(db)

/**
 * @swagger
 * /api/follow/{userId}:
 *   post:
 *     summary: Start following a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user to follow
 *     responses:
 *       201:
 *         description: The body contains status JSON
 */
followRouter.post("/follow/:userId", async (req: Request, res: Response) => {
    const {userId: followed} = req.params;
    const { userId } = res.locals.context;

    await followRepository.startFollow(userId, followed)

    return res.sendStatus(httpStatus.CREATED)
})


/**
 * @swagger
 * /api/unfollow/{userId}:
 *   post:
 *     summary: stop following a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user to unfollow
 *     responses:
 *       200:
 *         description: The body contains status JSON
 */
followRouter.post("/unfollow/:userId", async (req: Request, res: Response) => {
    const { userId: followed } = req.params;
    const { userId } = res.locals.context;

    await followRepository.stopFollow(userId, followed)

    return res.sendStatus(httpStatus.OK)
})