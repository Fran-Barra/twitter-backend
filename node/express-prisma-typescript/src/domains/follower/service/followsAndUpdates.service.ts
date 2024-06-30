export interface FollowsAndUpdatesService {
    subscribeToOnStoppedFollowing: (subscriber: OnStoppedFollowingObserver) => void

    userFollows: (followerId: string, followedId: string) => Promise<boolean> 
    userFollowsAll: (followerId: string, followedIds: string[]) => Promise<boolean>
    allUsersFollowEachOther: (usersId: string[]) => Promise<boolean>
}

export interface OnStoppedFollowingObserver {
    onStoppedFollowingAction: (followerId: string, followedId: string) => Promise<void>
}
