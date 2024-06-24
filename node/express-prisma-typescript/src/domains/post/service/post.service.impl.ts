import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { ImageService } from '@domains/image'
import { AuthToSeeUserPosts } from '@domains/auth/service'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly imageService: ImageService,
    private readonly authToSeeUserPost: AuthToSeeUserPosts
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const post = await this.repository.create(userId, data)
    if (data.images === undefined) return post

    post.images = await this.imageService.generateLinksForPostImages(post.id, data.images.length)
    return await this.repository.create(userId, post)
  }

  async createComment(userId: string, postId: string, data: CreatePostInputDTO) : Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const authorized = await this.authToSeeUserPost.authorized(userId, post.authorId)
    if (authorized === true) throw new NotFoundException('post')
      
    const comment = await this.repository.create(userId, {
        content: data.content,
        images: data.images,
        commentedPostId: postId
      })
    if (data.images === undefined) return comment
      
    comment.images = await this.imageService.generateLinksForPostImages(comment.id, data.images.length)
    return await this.repository.create(userId, comment)
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

  async getCommentsFromPost(userId: string, postId: string, options: CursorPagination) : Promise<ExtendedPostDTO[]> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const authorized = await this.authToSeeUserPost.authorized(userId, post.authorId)
    if (authorized === true) throw new NotFoundException('post')

    return this.repository.getCommentsFromPost(postId, options)
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
