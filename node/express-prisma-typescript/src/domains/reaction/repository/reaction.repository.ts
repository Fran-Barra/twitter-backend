import { Reaction } from "../dto";

export interface ReactionRepository {
    reactToPost(reaction: Reaction): Reaction
    removeReactionToPost(reaction: Reaction): Reaction
}