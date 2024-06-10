
export interface ReactionDTO {
    readonly postId: String
    readonly userId: String
    readonly reactionType: number
}

export interface Reaction {
    readonly id: String
    readonly postId: String
    readonly userId: String
    readonly reactionType: number
}