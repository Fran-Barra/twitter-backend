import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { prismaMock } from "../../../../singleton"
import {FollowRepositoryImpl} from "../../../../src/domains/follow/repository/follow.repository.impl"
import db from "../../../../src/utils/database"

test("if follower follow exists but delete then update delete to null", async () => {
    const FollowRepository = new FollowRepositoryImpl(db)
})