export interface FollowService {
    startFollow: (follower: string, followed: string) => Promise<void>
    stopFollow: (follower: string, followed: string) => Promise<void>
}