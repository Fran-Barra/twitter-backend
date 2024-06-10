import { ReactionType } from "@prisma/client"

export interface ReactionDTO {
    readonly postId: string
    readonly userId: string
    readonly reactionType: ReactionType
}

export interface Reaction {
    readonly id: string
    readonly postId: string
    readonly userId: string
    readonly reactionType: ReactionType
}