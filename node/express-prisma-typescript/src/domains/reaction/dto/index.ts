import { ReactionType } from "@prisma/client"

export interface ReactionDTO {
    readonly postId: string
    readonly userId: string
    readonly reactionType: ReactionType
}

/**
 * @swagger
 * components:
 *  schemas:
 *    Reaction:
 *      tags:
 *        - reaction
 *      properties:
 *        id:
 *          type: string
 *          description: the id of the reaction
 *        userId:
 *          type: string
 *          description: the user that reacted
 *        postId:
 *          type: string
 *          description: the id of the post reacted
 *        reactionType:
 *          type: string
 *          description: the type of reaction
 */
export interface Reaction {
    readonly id: string
    readonly postId: string
    readonly userId: string
    readonly reactionType: ReactionType
}


export function stringToReactionType(str: string): ReactionType | undefined{
    if (str === "0" || str.toLowerCase() === "like") return ReactionType.Like
    if (str === "1" || str.toLowerCase() === "retweet") return ReactionType.Retweet
    return undefined
}