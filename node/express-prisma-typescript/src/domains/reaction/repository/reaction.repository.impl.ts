import { PrismaClient } from "@prisma/client";
import { ReactionRepository } from "./reaction.repository";
import { Reaction, ReactionDTO } from "../dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

export class ReactionRepositoryImpl implements ReactionRepository {
    constructor(
        private readonly db: PrismaClient
    ) {}


    async reactToPost(reaction: ReactionDTO): Promise<Reaction> {
        try {
            return await this.db.reaction.create({data: reaction})
        } catch(err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.message.includes("unique_post_reaction") && err.code === "P2002") 
                    await this.removeDeletedAt(reaction)
                else throw err
            }
            throw err
        }
    }

    async removeDeletedAt(reaction: ReactionDTO): Promise<Reaction> {
        return await this.db.reaction.update({
            where: {
                unique_post_reaction: reaction
            },
            data: {
                deletedAt: null
            }
        })
    }

    async removeReactionToPost(reaction: ReactionDTO): Promise<void> {
        await this.db.reaction.update({
            where: {
                unique_post_reaction: reaction
            },
            data: {
                deletedAt: new Date()
            }
        })
        return
    }
}