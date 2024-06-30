import { UserIsPublicOrViewerFollowsUser } from "../../../../src/domains/auth/service/userIsPublicOrViewerFollowsUser.service.impl"
import { UserRepositoryMock } from "../../user/repository/user.repository.mock"
import { FollowServiceImpl } from "../../../../src/domains/follower/service/follow.service.impl"
import { FollowRepositoryMock } from "../../follow/follow.respository.mock"
import { user1, user2 } from "./data"

let mockFollowRepository = new FollowRepositoryMock()
let mockUserRepository = new UserRepositoryMock()
let auth = new UserIsPublicOrViewerFollowsUser(mockUserRepository, new FollowServiceImpl(mockFollowRepository))
beforeEach(()=>{
    mockFollowRepository = new FollowRepositoryMock()
    mockUserRepository = new UserRepositoryMock()
    auth = new UserIsPublicOrViewerFollowsUser(mockUserRepository, new FollowServiceImpl(mockFollowRepository))

})

describe("user is public or viewer follows user test", ()=>{

    test("auth to see own post when private", async ()=>{
        mockUserRepository.setUserForGetById("1", user1)
        const authorized = await auth.authorized("1", "1")
        expect(authorized).toBeTruthy()
    })

    test("auth to see public user", async () => {
        mockUserRepository.setUserForGetById("1", user1)
        mockUserRepository.setUserForGetById("2", user2)
        const authorized = await auth.authorized("1", "2")
        expect(authorized).toBeTruthy()
    })

    test("not authorized to see private user", async () => {
        mockUserRepository.setUserForGetById("1", user1)
        mockUserRepository.setUserForGetById("2", user2)
        const authorized = await auth.authorized("2", "1")
        expect(authorized).toBeFalsy()
    })

    test("authorized to see private user that is followed", async () => {
        mockUserRepository.setUserForGetById("1", user1)
        mockUserRepository.setUserForGetById("2", user2)
        mockFollowRepository.setFollowsToTrue()
        const authorized = await auth.authorized("2", "1")
        expect(authorized).toBeTruthy()
    })
})