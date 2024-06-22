export interface FollowsUser {
    userFollows: (followerId: string, followedId: string) => Promise<boolean> 
}