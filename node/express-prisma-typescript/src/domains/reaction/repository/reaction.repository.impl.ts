import { Post, Prisma, PrismaClient, ReactionType } from "@prisma/client";
import { ReactionRepository } from "./reaction.repository";
import { Reaction, ReactionDTO } from "../dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";

export class ReactionRepositoryImpl implements ReactionRepository {
    constructor(
        private readonly db: PrismaClient
    ) {}

    async reactToPost(reaction: ReactionDTO) : Promise<Reaction> {
        const existingReaction = await this.db.reaction.findUnique({
            where: {unique_post_reaction: reaction}
        })
        if (existingReaction === null) return this.createNewReaction(reaction)
        if (existingReaction.deletedAt !== null) this.reactivateReaction(existingReaction)
        return existingReaction
    }

    private async createNewReaction(reaction: ReactionDTO) : Promise<Reaction> {
        const react = await this.db.$transaction(async pr => {
            const createdReaction = await pr.reaction.create({data: reaction})
            await this.IncreaseReactionCounterInPost(createdReaction.postId, createdReaction.reactionType, pr)
            return createdReaction
        })
        return react
    }

    private async reactivateReaction(reaction: Reaction) : Promise<Reaction> {
        const react = await this.db.$transaction(async pr => {
            const updatedReaction = await pr.reaction.update({where: {unique_post_reaction: reaction}, data: {deletedAt: null}})
            await this.IncreaseReactionCounterInPost(updatedReaction.postId, updatedReaction.reactionType, pr)
            return updatedReaction
        })
        return react
    }

    private async IncreaseReactionCounterInPost(postId: string, type: ReactionType, transaction: Prisma.TransactionClient) : Promise<void> {
        if (type == ReactionType.Like) {
            await transaction.post.update({ where: {id: postId}, data: {qtyLikes: {increment: 1}}})
        } else if (type == ReactionType.Retweet) {
            await transaction.post.update({ where: {id: postId}, data: {qtyRetweets: {increment: 1}}})
        }
        //TODO: see possible ways to manage this
        else throw Error(`encountered unexpected reaction type ${type}`)
    }

    async removeReactionToPost(reaction: ReactionDTO): Promise<void> {
        const existingReaction = await this.db.reaction.findUnique({
            where: {unique_post_reaction: reaction}
        })
        if (existingReaction === null || existingReaction.deletedAt !== null) return
        
        await this.db.$transaction(async pr => {
            const promises = []
            promises.push(pr.reaction.update({where: {unique_post_reaction: reaction}, data: {deletedAt: new Date()}}))

            if (reaction.reactionType == ReactionType.Like) {
                promises.push(pr.post.update({ where: {id: reaction.postId}, data: {qtyLikes: {decrement: 1}}}))
            } else if (reaction.reactionType == ReactionType.Retweet) {
                promises.push(pr.post.update({ where: {id: reaction.postId}, data: {qtyRetweets: {decrement: 1}}}))
            }
            //TODO: see possible ways to manage this
            else throw Error(`encountered unexpected reaction type ${reaction.reactionType}`)
            return Promise.all(promises)
        })
    }

    async getUserRetweets(authorId: string, options: CursorPagination): Promise<PostDTO[]>{
        const posts = await this.db.post.findMany({
            where: {
                reactions: {
                    some: { 
                        userId: authorId,
                        reactionType: ReactionType.Retweet
                    }
                }
            },
            cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            orderBy: [
              {
                createdAt: 'desc'
              },
              {
                id: 'asc'
              }
            ]
        })
        return posts
    }

    async getPublicAndFollowedUsersPostsLikedByTheLiker(userId: string, likerId: string, options: CursorPagination) : Promise<PostDTO[]> {
        const posts = await this.db.post.findMany({
            where: {
                reactions: {
                    some: { 
                        userId: likerId,
                        reactionType: ReactionType.Like,
                        post: {
                            OR: [
                                {
                                  author: {private: false}
                                },
                                {
                                  author: {
                                    followers: {
                                      some: {
                                        followerId: userId,
                                        deletedAt: null
                                      }
                                    }
                                  }
                                }
                              ]
                        }
                    }
                }
            },
            cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            orderBy: [
              {
                createdAt: 'desc'
              },
              {
                id: 'asc'
              }
            ]
        })
        return posts
    }

}