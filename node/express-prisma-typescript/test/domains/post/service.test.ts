import { PostServiceImpl } from "../../../src/domains/post/service/post.service.impl"
import { PostRepositoryImpl } from "../../../src/domains/post/repository"
import { prismaMock } from "../../singleton"
import { CreatePostInputDTO, PostDTO } from "../../../src/domains/post/dto"
import { ImageServiceMock } from "./imageService.mock"
import { AuthToSeeUserPostsMock } from "./authToSeePosts.mock"
import { commentPrismaMock, postPrismaMock } from "./data"
import { NotFoundException } from "../../../src/utils"

let authToSeePosts = new AuthToSeeUserPostsMock()
let postService = new PostServiceImpl(
    new PostRepositoryImpl(prismaMock), 
    new ImageServiceMock(), 
    authToSeePosts
)
beforeEach(() => {
    authToSeePosts = new AuthToSeeUserPostsMock()
    postService = new PostServiceImpl(
        new PostRepositoryImpl(prismaMock), 
        new ImageServiceMock(), 
        authToSeePosts
    )
})


describe("post tests", () => {
    test("create post wit only content", async () => {
        prismaMock.post.create.mockResolvedValue(postPrismaMock)

        
        const post: CreatePostInputDTO = {
            content: "hi",
        }
        const result = await postService.createPost("2", post)
        
        expect(result).toEqual(new PostDTO(postPrismaMock))
    })
})


describe("comment tests", () => {
    test("create comment for post", async () => {
        prismaMock.post.create.mockResolvedValue(commentPrismaMock)

        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
        prismaMock.post.findUnique.mockResolvedValue(postPrismaMock)
        authToSeePosts.setResult(true)
        
        const commentData : CreatePostInputDTO = {
            content: "nice post"
        }
        const comment : PostDTO = await postService.createComment('2', '1', commentData)

        expect(comment).toEqual(new PostDTO(commentPrismaMock))
    })

    test("post does not exists", async () => {
        prismaMock.post.create.mockResolvedValue(commentPrismaMock)

        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
        authToSeePosts.setResult(true)
        
        const commentData : CreatePostInputDTO = {
            content: "nice post"
        }
        await expect(postService.createComment('2', '1', commentData)).rejects.toThrow(new NotFoundException('post'))
    })

    test("not authorized to see post", async () => {
        prismaMock.post.create.mockResolvedValue(commentPrismaMock)

        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
        prismaMock.post.findUnique.mockResolvedValue(postPrismaMock)
        authToSeePosts.setResult(false)
        
        const commentData : CreatePostInputDTO = {
            content: "nice post"
        }

        await expect(postService.createComment('2', '1', commentData)).rejects.toThrow(new NotFoundException('post'))
    })

})