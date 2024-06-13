import { PostDTO } from "@domains/post/dto";
import { Reaction, ReactionDTO } from "../dto";
import { CursorPagination } from "@types";

export interface ReactionRepository {
    reactToPost(reaction: ReactionDTO): Promise<Reaction>
    removeReactionToPost(reaction: ReactionDTO): Promise<void>
    getUserRetweets: (authorId: string, options: CursorPagination) => Promise<PostDTO[]>
}