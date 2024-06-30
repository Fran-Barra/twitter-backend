import db from "@utils/database";
import { PostRepositoryImpl } from "../repository";
import { PostService, PostServiceImpl } from "../service";
import { UserIsPublicOrViewerFollowsUser } from "@domains/auth/service";
import { UserRepositoryImpl } from "@domains/user/repository";
import { imageService } from "@domains/image";
import followService from "@domains/follower/resource";

export const service: PostService = new PostServiceImpl(
    new PostRepositoryImpl(db),
    imageService,
    new UserIsPublicOrViewerFollowsUser(new UserRepositoryImpl(db), followService),
)
