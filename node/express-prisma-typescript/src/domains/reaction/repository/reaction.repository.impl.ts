import { PrismaClient, ReactionType } from "@prisma/client";
import { ReactionRepository } from "./reaction.repository";
import { Reaction, ReactionDTO } from "../dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";

export class ReactionRepositoryImpl implements ReactionRepository {
    constructor(
        private readonly db: PrismaClient
    ) {}

    async reactToPost(reaction: ReactionDTO): Promise<Reaction> {
        try {
            return await this.db.reaction.create({data: reaction})
        } catch(err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.message.includes("unique_post_reaction") && err.code === "P2002") 
                    await this.removeDeletedAt(reaction)
                else throw err
            }
            throw err
        }
    }

    async removeDeletedAt(reaction: ReactionDTO): Promise<Reaction> {
        return await this.db.reaction.update({
            where: {
                unique_post_reaction: reaction
            },
            data: {
                deletedAt: null
            }
        })
    }

    async removeReactionToPost(reaction: ReactionDTO): Promise<void> {
        await this.db.reaction.update({
            where: {
                unique_post_reaction: reaction
            },
            data: {
                deletedAt: new Date()
            }
        })
        return
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