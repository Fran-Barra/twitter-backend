import { db } from "@utils";
import { FollowRepositoryImpl } from "../repository/follow.repository.impl";
import { FollowServiceImpl } from "../service/follow.service.impl";

const followService = new FollowServiceImpl(new FollowRepositoryImpl(db))
export default followService