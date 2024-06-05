import { Request, Response, Router } from "express";
import { FollowRepository } from "../repository/follow.repository";
import { FollowRepositoryImpl } from "../repository/follow.repository.impl";
import { db } from "@utils";
import httpStatus from "http-status";


export const followRouter: Router = Router()

//dependencies
const followRepository: FollowRepository = new FollowRepositoryImpl(db)

followRouter.post("/follow/:userId", async (req: Request, res: Response) => {
    const {userId: followed} = req.params;
    const { userId } = res.locals.context;

    await followRepository.startFollow(userId, followed)

    return res.sendStatus(httpStatus.CREATED)
})