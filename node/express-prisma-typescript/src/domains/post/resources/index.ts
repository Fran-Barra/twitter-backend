import db from "@utils/database";
import { PostRepositoryImpl } from "../repository";
import { PostService, PostServiceImpl } from "../service";
import { UserIsPublicOrViewerFollowsUser } from "@domains/auth/service";
import { UserRepositoryImpl } from "@domains/user/repository";
import { FollowsUserImpl } from "@domains/follower";

export const service: PostService = new PostServiceImpl(
    new PostRepositoryImpl(db),
    new UserIsPublicOrViewerFollowsUser(new UserRepositoryImpl(db), new FollowsUserImpl(db))
)
