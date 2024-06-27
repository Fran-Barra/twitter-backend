import { PrismaClient } from "@prisma/client";
import { FollowRepository } from "./follow.repository";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

export class FollowRepositoryImpl implements FollowRepository {
    constructor(private readonly db : PrismaClient) {}

    async startFollow(follower: string, followed: string): Promise<void> {
        try {
        await this.db.follow.create(
            {
                data: {
                    followerId: follower,
                    followedId: followed
                }
            }
        )
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            if (e.message.includes("unique_follower_follow") && e.code === "P2002") 
                await this.removeDeletedAt(follower, followed)
            else throw e
        }
        throw e
    }
    }

    private async removeDeletedAt(follower: string, followed: string): Promise<void> {
        await this.db.follow.update({
            where: {
                unique_follower_follow: {
                    followerId: follower,
                    followedId: followed
                }
            },
            data: {
                deletedAt: null
            }
        });
    }
    
    async stopFollow(follower: string, followed: string): Promise<void> {
        await this.db.follow.update({
            where: {
                unique_follower_follow: {
                    followedId: follower,
                    followerId: followed
                }
            },
            data: {
                deletedAt: new Date()
            }
        });
    }

    async userFollows(followerId: string, followedId: string) : Promise<boolean> {
        const date = await this.db.follow.findUnique({
            where: {
              unique_follower_follow: {
                  followerId: followerId,
                  followedId: followedId
              },
            },
            select: {
              deletedAt: true
            }
          });
      
          //relation does not exist
          if (date === null) return false
          return date.deletedAt === null
    }

    async userFollowsAll(followerId: string, followedIds: string[]) : Promise<boolean> {
        const follows = await this.db.follow.findMany({
            where: {
                followerId: followerId,
                followedId: {
                    in: followedIds
                },
                deletedAt: null
            },
            select: {
                id: true,
            }
        });

        return followedIds.length <= follows.length
    }


}