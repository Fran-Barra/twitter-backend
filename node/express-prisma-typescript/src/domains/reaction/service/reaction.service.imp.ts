import { PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { ReactionRepository } from "../repository/reaction.repository";
import { ReactionService } from "./reaction.service";
import { NotFoundException } from "@utils";
import { AuthToSeeUserPosts } from "@domains/auth/service";

export class ReactionServiceImpl implements ReactionService {
    constructor(
        private readonly reactionRepository: ReactionRepository,
        private readonly authToSeeUserPost: AuthToSeeUserPosts
    ) {}

    async getUserRetweets(userId: string, author: string, options: CursorPagination) : Promise<PostDTO[]>{
        const viewAuth = await this.authToSeeUserPost.authorized(userId, author)
        if (!viewAuth) throw new NotFoundException("post")

        return await this.reactionRepository.getUserRetweets(author, options)
    }
}