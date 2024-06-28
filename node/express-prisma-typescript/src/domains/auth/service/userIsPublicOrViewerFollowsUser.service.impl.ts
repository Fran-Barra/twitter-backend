import { UserRepository } from "@domains/user/repository";
import { AuthToSeeUserPosts } from "./authToSeeUserPosts.service";
import { NotFoundException } from "@utils";
import { FollowsAndUpdatesService } from "@domains/follower";

export class UserIsPublicOrViewerFollowsUser implements AuthToSeeUserPosts {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userFollows: FollowsAndUpdatesService
    ) {}

    async authorized(viewerUserId: string, viewedUsedId: string) : Promise<boolean> {
        const isPublic = await this.userIsPublic(viewedUsedId)
        if (isPublic) return true
        return await this.userFollows.userFollows(viewerUserId, viewedUsedId)
    }

    private async userIsPublic(userId: string) : Promise<boolean> {
        const user = await this.userRepository.getById(userId);
        if (!user) throw new NotFoundException('user')
        return !user.private
    }   
}