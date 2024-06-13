import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { AuthToSeeUserPosts } from '@domains/auth/service'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly authToSeeUserPost: AuthToSeeUserPosts
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async createComment(userId: string, postId: string, data: CreatePostInputDTO) : Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const authorized = await this.authToSeeUserPost.authorized(userId, post.authorId)
    if (authorized === true) throw new NotFoundException('post')
      
    return await this.repository.create(userId, {
      content: data.content,
      images: data.images,
      commentedPostId: postId
    })
  }


  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const authorized = await this.authToSeeUserPost.authorized(userId, post.authorId)
    if (authorized === true) throw new NotFoundException('post')

    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    //TODO: what if i ask the follower domain for my followed and filter considering that instead of making a request.
    //that would leave me with some memory in the server, consider how much memory space does this option takes and other factors.
    return await this.repository.getAllPublicAndFollowedUsersPostByDatePaginated(userId, options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const authorized = await this.authToSeeUserPost.authorized(userId, authorId)
    if (authorized === true) throw new NotFoundException('post')
    return await this.repository.getByAuthorId(authorId)
  }
}
