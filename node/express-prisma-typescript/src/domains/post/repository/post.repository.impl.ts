import { Prisma, PrismaClient, ReactionType } from '@prisma/client'

import { CursorPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostOrCommentInputDTO, ExtendedPostDTO, PostDTO } from '../dto'


type CustomPostFindManyArgs = Omit<Prisma.PostFindManyArgs, 'include'> & {
  include: {
    author: boolean | undefined,
    reactions: Prisma.Post$reactionsArgs | undefined
  }
};

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

  async getById (postId: string, userId?: string): Promise<ExtendedPostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        reactions: {
          where: {
            userId,
            deletedAt: null
          },
          select: {reactionType: true}
        }
      }
    })
    return (post != null) ? new ExtendedPostDTO({
      ...post,
      likedByUser: post.reactions.some(r=>r.reactionType==ReactionType.Like),
      retweetedByUser: post.reactions.some(r=>r.reactionType==ReactionType.Retweet)
    }) : null
  }

  getByAuthorId (authorId: string, userId? : string): Promise<ExtendedPostDTO[]> {
    const queryOptions: CustomPostFindManyArgs = {
      where: {
        authorId,
        commentedPost: null
      },
      include: {
        author: true,
        reactions: undefined
      }
    }

    return this.addReactionsInfoToPost(queryOptions, userId)
  }

  getAllFollowedUserPostsByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const args : CustomPostFindManyArgs = {
      where: {
        author: {
          followers: {
            some: {
              followerId: userId,
              deletedAt: null
            }
          }
        },
        commentedPost: null
      },
      include: {
        author: true,
        reactions: undefined
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
    }
    return this.addReactionsInfoToPost(args, userId);
  }

  getAllPublicAndFollowedUsersPostByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const args : CustomPostFindManyArgs = {
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
        author: true,
        reactions: undefined
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
    }
    return this.addReactionsInfoToPost(args, userId);
  }

  async getCommentsFromPost(postId: string, options: CursorPagination, userId?: string) : Promise<ExtendedPostDTO[]> {
    const args : CustomPostFindManyArgs = {
      where: {
        commentedPostId: postId
      },
      include: {author: true, reactions: undefined},
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: {
        reactions: {
          _count: 'asc'
        }
      }
    }
    return this.addReactionsInfoToPost(args, userId)
  }

  /**
   * Add to the method were you want to get post info and add likedByUser and retweetedByUser info.
   * How to use: implement the args respecting the CustomPostFindManyArgs and pass the userId.
   * If the user Id does not exist then the query will return all what you need but without the liked and retweet info.
   * @param args The arguments you want to add, respecting the CustomPostFindManyArgs
   * @param userId The user from which the reaction info is.
   */
  addReactionsInfoToPost(args: CustomPostFindManyArgs, userId?: string) : Promise<ExtendedPostDTO[]> {
    if (userId) {
      args.include.reactions = {
          where: {
            userId,
            deletedAt: null
          },
          select: {reactionType: true}
      }
    }

    const posts = this.db.post.findMany<CustomPostFindManyArgs>(args)

    if (!userId) return posts

    
    return posts.then((posts)=>{
      return posts.map(post=>{
        return new ExtendedPostDTO({
        ...post,
        likedByUser: post.reactions.some(r=>r.reactionType==ReactionType.Like),
        retweetedByUser: post.reactions.some(r=>r.reactionType==ReactionType.Retweet)
      })})
    })
  }
}
