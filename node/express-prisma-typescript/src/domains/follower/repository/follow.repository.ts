
export interface FollowRepository {
    startFollow: (follower: string, followed: string) => Promise<void>
    stopFollow: (follower: string, followed: string) => Promise<void>

    userFollows: (followerId: string, followedId: string) => Promise<boolean> 
    userFollowsAll: (followerId: string, followedIds: string[]) => Promise<boolean>
    allUsersFollowEachOther: (usersId: string[]) => Promise<boolean>
}