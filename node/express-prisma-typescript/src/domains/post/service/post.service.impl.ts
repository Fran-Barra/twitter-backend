import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async createComment(userId: string, postId: string, data: CreatePostInputDTO) : Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const authorized = await this.authorizedToSeeAuthorPosts(userId, post.authorId)
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

    const authorized = await this.authorizedToSeeAuthorPosts(userId, post.authorId)
    if (authorized === true) throw new NotFoundException('post')

    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    //TODO: what if i ask the follower domain for my followed and filter considering that instead of making a request.
    //that would leave me with some memory in the server, consider how much memory space does this option takes and other factors.
    return await this.repository.getAllPublicAndFollowedUsersPostByDatePaginated(userId, options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const authorized = await this.authorizedToSeeAuthorPosts(userId, authorId)
    if (authorized === true) throw new NotFoundException('post')
    return await this.repository.getByAuthorId(authorId)
  }

  /**
   * Author must exist and has to be public or user must follow it
   * @param userId 
   * @param authorId 
   * @returns if the user has access to the posts
   */
  private async authorizedToSeeAuthorPosts(userId: string, authorId: string) : Promise<Boolean> {
    //TODO: what happens if I have a service of follower that tells me if I follow a user and what happens
    //if I also have a user service that tells me if the user is private.
    //TODO: what if I have a privacy domain with view permits?
    const privacy = await this.repository.getUserPrivacyById(authorId)
    if (privacy === null) throw new NotFoundException('user')
    if (privacy.private === false) return true
    return await this.repository.userFollows(userId, authorId)
  }
}
