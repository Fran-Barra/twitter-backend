import { Request, Response, Router } from "express";
import httpStatus from "http-status";
import followService from "../resource";
import { FollowService } from "../service/follow.service";


export const followRouter: Router = Router()

//dependencies
const followS : FollowService = followService

/**
 * @swagger
 * /api/follower/follow/{userId}:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - follow
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

    await followS.startFollow(userId, followed)

    return res.sendStatus(httpStatus.CREATED)
})


/**
 * @swagger
 * /api/follower/unfollow/{userId}:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - follow
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

    await followS.stopFollow(userId, followed)

    return res.sendStatus(httpStatus.OK)
})