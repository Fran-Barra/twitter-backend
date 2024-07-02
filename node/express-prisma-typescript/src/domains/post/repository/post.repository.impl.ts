import { PrismaClient } from '@prisma/client'

import { CursorPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostOrCommentInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}

  create (userId: string, data: CreatePostOrCommentInputDTO): Promise<PostDTO> {    
    if (data.commentedPostId === undefined) return this.createPost(userId, data)
    return this.createComment(userId, data)
  }

  private async createPost(userId: string, data: CreatePostOrCommentInputDTO) : Promise<PostDTO> {
    return new PostDTO(await this.db.post.create({
      data: {
        authorId: userId,
        ...data
      }
    }))
  }

  

  private async createComment(userId: string, data: CreatePostOrCommentInputDTO) : Promise<PostDTO>{
    if (data.commentedPostId === undefined) throw new Error("method used incorrectly, expecting commentedPostId")
    
    const comment = await this.db.$transaction(async pr => {
      const commentPromise = pr.post.create({
        data: {
          authorId: userId,
          ...data
        }
      })

      await pr.post.update({
        where: {id: data.commentedPostId},
        data: {
          qtyComments: {
            increment: 1
          }
        }
      })
      return await commentPromise
    })    
    return new PostDTO(comment)
  }

  async saveImagesLinks(postId: string, links: string[]) : Promise<PostDTO> {
    const post = await this.db.post.update({
      where: {
        id: postId
      },
      data: {
        images: links
      }
    })
    return new PostDTO(post)
  }


  async getAllByDatePaginated (options: CursorPagination): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts.map(post => new PostDTO(post))
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      }
    })
    return (post != null) ? new PostDTO(post) : null
  }

  getByAuthorId (authorId: string): Promise<ExtendedPostDTO[]> {
    return this.db.post.findMany({
      where: {
        authorId,
        commentedPost: null
      },
      include: {
        author: true
      }
    })
  }

  async getAllPublicAndFollowedUsersPostByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        OR: [
          {
            author: {
              private: false
          }},
          {
            author: {
              followers: {
                some: {
                  followerId: userId,
                  deletedAt: null
                }
              }
            }
          }
        ],
        commentedPost: null
      },
      include: {
        author: true
      },
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts
  }

  async getCommentsFromPost(postId: string, options: CursorPagination) : Promise<ExtendedPostDTO[]> {
    const result = await this.db.post.findMany({
      where: {
        commentedPostId: postId
      },
      include: {author: true},
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: {
        reactions: {
          _count: 'asc'
        }
      }
    })
    return result
  }
}
