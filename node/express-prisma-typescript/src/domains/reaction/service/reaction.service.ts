import { PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";

export interface ReactionService {
    getUserRetweets: (userId: string, author: string, options: CursorPagination) => Promise<PostDTO[]>
}