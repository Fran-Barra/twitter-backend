import { OnStoppedFollowingObserver } from "../../../src/domains/follower/service/followsAndUpdates.service";

export class OnStoppedFollowingObserverMock implements OnStoppedFollowingObserver {
    onStoppedFollowingAction(followerId: string, followedId: string) : Promise<void>{
        return Promise.resolve()
    }
}