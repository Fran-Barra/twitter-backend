import { Request, Response, Router } from "express";
import { ReactionRepository } from "../repository/reaction.repository";
import { ReactionRepositoryImpl } from "../repository/reaction.repository.impl";
import { ValidationException, db } from "@utils";
import httpStatus from "http-status";
import { stringToReactionType } from "../dto";

import 'express-async-errors'
import { ReactionService } from "../service/reaction.service";
import { ReactionServiceImpl } from "../service/reaction.service.imp";
import { UserIsPublicOrViewerFollowsUser } from "@domains/auth/service";
import { UserRepositoryImpl } from "@domains/user/repository";
import { FollowsUserImpl } from "@domains/follower";



export const reactionRouter = Router()

const reactionRepository: ReactionRepository = new ReactionRepositoryImpl(db);

const reactionService: ReactionService = new ReactionServiceImpl(
    reactionRepository, 
    new UserIsPublicOrViewerFollowsUser(new UserRepositoryImpl(db), new FollowsUserImpl(db))
)


/**
 * @swagger
 * /api/reaction/{postId}:
 *  post:
 *    tags:
 *      - reaction
 *    summary: react to a post
 *    parameters:
 *      - in: path
 *        name: postId
 *        required: true
 *        description: The ID of the post to react to
 *        schema:
 *          type: string
 *    requestBody:
 *      description: The information of the reaction
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            ReactionDTO:
 *              tags:
 *                - reaction
 *              properties:
 *                  reactionType:
 *                      type: ReactionType
 *                      description: like, retweet
 *    responses:
 *      200:
 *        description: The created post
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Reaction'
 *      400:
 *        description: Something was wrong with the body
 */
reactionRouter.post("/:post_id", async (req: Request, res: Response)=>{
    const {post_id: postId} = req.params;
    const { userId } = res.locals.context;
    const { reactionType : type } = req.body
    const reactionType = stringToReactionType(type);
    if (reactionType === undefined) throw new ValidationException([{error: "reactionType must be one of the followings: like,0,retweet,1"}])
    
    const reaction = await reactionRepository.reactToPost({postId: postId, userId: userId, reactionType: type})
    return res.status(httpStatus.CREATED).json(reaction)
})


/**
 * @swagger
 * /api/reaction/{postId}:
 *  delete:
 *    tags:
 *      - reaction
 *    summary: react to a post
 *    parameters:
 *      - in: path
 *        name: postId
 *        required: true
 *        description: The ID of the post to react to
 *        schema:
 *          type: string
 *    requestBody:
 *      description: The information of the reaction
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            ReactionDTO:
 *              tags:
 *                - reaction
 *              properties:
 *                  reactionType:
 *                      type: ReactionType
 *                      description: like, retweet
 *    responses:
 *      200:
 *        description: the reaction was deleted
 *      400:
 *        description: Something was wrong with the body
 */
reactionRouter.delete("/:post_id", async (req: Request, res: Response)=>{
    const {post_id: postId} = req.params;
    const { userId } = res.locals.context;
    const { reactionType : type } = req.body
    const reactionType = stringToReactionType(type);
    if (reactionType === undefined) throw new ValidationException([{error: "reactionType must be one of the followings: like,0,retweet,1"}])
    
    const reaction = await reactionRepository.removeReactionToPost({postId: postId, userId: userId, reactionType: type})
    return res.status(httpStatus.OK).json(reaction)
})


/**
 * @swagger
 * /api/reaction/retweets/by_user/{userId}:
 *  delete:
 *    tags:
 *      - reaction
 *    summary: get retweets of a user
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        description: The ID of the post to react to
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A list of posts retweeted by the user, may be empty
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/PostDTO'
 *      404:
 *        description: The author is private and user does not follow them or does not exist
 */
reactionRouter.get("/retweets/by_user/:userId", async (req: Request, res: Response) => {
    const { userId : author } = req.params;
    const { userId : userId } = res.locals.context;
    const { limit, before, after } = req.query as Record<string, string>

    const retweets = await reactionService.getUserRetweets(userId, author, { limit: Number(limit), before, after });
    return res.status(httpStatus.OK).json(retweets)
})
//TODO: should a user be able to see the retweet if the original owner is private?

/**
 * @swagger
 * /api/reaction/likes/by_user/{userId}:
 *  delete:
 *    tags:
 *      - reaction
 *    summary: get posts liked by the user
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        description: The ID of the user to get the likes from
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A list of posts liked by the user, may be empty. Only shows public or followed users posts
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/PostDTO'
 *      404:
 *        description: The author is private and user does not follow them or does not exist
 */
reactionRouter.get("/likes/by_user/:userId", async (req: Request, res: Response) => {
    const { userId : author } = req.params;
    const { userId : userId } = res.locals.context;
    const { limit, before, after } = req.query as Record<string, string>

    const retweets = await reactionService.getPublicAndFollowedUsersPostsLikedByTheUser(
        userId, author, { limit: Number(limit), before, after }
    );
    return res.status(httpStatus.OK).json(retweets)
})