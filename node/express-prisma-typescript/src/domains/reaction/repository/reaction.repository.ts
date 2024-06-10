import { Reaction, ReactionDTO } from "../dto";

export interface ReactionRepository {
    reactToPost(reaction: ReactionDTO): Promise<Reaction>
    removeReactionToPost(reaction: ReactionDTO): Promise<void>
}