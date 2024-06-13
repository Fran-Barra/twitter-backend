import { PrismaClient } from "@prisma/client";
import { FollowsUser } from "./follows.repository";

export class FollowsUserImpl implements FollowsUser {
    constructor (private readonly db: PrismaClient) {}

    async userFollows(followerId: string, followedId: string) : Promise<boolean> {
        const date = await this.db.follow.findUnique({
            where: {
              unique_follower_follow: {
                  followerId: followerId,
                  followedId: followedId
              }
            },
            select: {
              deletedAt: true
            }
          });
      
          //relation does not exist
          if (date === null) return false
          return date.deletedAt === null
    }

}