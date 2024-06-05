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

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    // TODO: validate that the author has public profile or the user follows the author
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows
    return await this.repository.getAllByDatePaginated(options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const privacy = await this.repository.getUserPrivacyById(userId)
    if (privacy === null) throw new NotFoundException('user')
    if (privacy.private === true) throw new ForbiddenException()
    return await this.repository.getByAuthorId(authorId)
  }
}
