import { Request, Response, Router } from "express";
import { ReactionRepository } from "../repository/reaction.repository";
import { ReactionRepositoryImpl } from "../repository/reaction.repository.impl";
import { ValidationException, db } from "@utils";
import httpStatus from "http-status";
import { stringToReactionType } from "../dto";

import 'express-async-errors'



export const reactionRouter = Router()

const reactionRepository: ReactionRepository = new ReactionRepositoryImpl(db);


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
