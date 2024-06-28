import { FollowRepository } from "../../../src/domains/follower/repository/follow.repository"

export class FollowRepositoryMock implements FollowRepository {

    constructor(
        private readonly follows: boolean = false,
        private readonly followsAll: boolean = false
    ) {}

    startFollow(follower: string, followed: string) : Promise<void> {
        return Promise.resolve()
    }
    stopFollow(follower: string, followed: string) : Promise<void> {
        return Promise.resolve()
    }

    userFollows(followerId: string, followedId: string) : Promise<boolean> {
        return Promise.resolve(this.follows)
    }

    userFollowsAll(followerId: string, followedIds: string[]) : Promise<boolean>{
        return Promise.resolve(this.followsAll)
    }

}