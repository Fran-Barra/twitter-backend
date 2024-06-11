import db from "@utils/database";
import { PostRepositoryImpl } from "../repository";
import { PostService, PostServiceImpl } from "../service";

export const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db))
