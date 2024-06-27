import { FollowRepository } from "../repository/follow.repository";
import { FollowsAndUpdatesService, OnStoppedFollowingObserver } from "./followsAndUpdates.service";
import { FollowService } from "./follow.service";
import { ValidationException } from "@utils";

export class FollowServiceImpl implements FollowService, FollowsAndUpdatesService {
    private readonly observers: OnStoppedFollowingObserver[]

    constructor(
        private readonly followRepository: FollowRepository
    ) {
        this.observers = []
    }

    startFollow(followerId: string, followedId: string) : Promise<void> {
        if (followerId === followedId) throw new ValidationException([new String(`followerId and followedId are the same`)])
        return this.followRepository.startFollow(followerId, followedId)
    }

    async stopFollow(followerId: string, followedId: string) : Promise<void> {
        await this.followRepository.stopFollow(followerId, followedId)
        this.observers.forEach(o => o.onStoppedFollowingAction(followerId, followedId))
    }

    subscribeToOnStoppedFollowing(subscriber: OnStoppedFollowingObserver) : void {
        this.observers.push(subscriber)
    }

    userFollows(followerId: string, followedId: string) : Promise<boolean> {
        return this.followRepository.userFollows(followedId, followedId)
    }

    userFollowsAll(followerId: string, followedIds: string[]) : Promise<boolean> {
        return this.followRepository.userFollowsAll(followerId, followedIds)
    }
}