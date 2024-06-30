import { FollowRepository } from "../../../src/domains/follower/repository/follow.repository"

export class FollowRepositoryMock implements FollowRepository {

    constructor(
        private follows: boolean = false,
        private readonly followsAll: boolean = false,
        private readonly followsEachOther: boolean = false
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

    allUsersFollowEachOther(usersId: string[]) : Promise<boolean> {
        return Promise.resolve(this.followsEachOther)
    }

    public setFollowsToTrue() {
        this.follows = true
    }
}