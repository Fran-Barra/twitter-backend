import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ExtendedUserDTO } from '@domains/user/dto'


/**
 * @swagger
 * components:
 *  schemas:
 *    CreatePostInputDTO:
 *      tags:
 *        - post
 *      properties:
 *        content:
 *          type: string
 *          description: the content of the post
 *        images:
 *          type: array
 *          items:
 *            type: string
 *          description: the images of the post. Is optional
 */
export class CreatePostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4)
    images?: string[]
}

/**
 * @swagger
 * components:
 *  schemas:
 *    PostDTO:
 *      tags:
 *        - post
 *      properties:
 *        id:
 *          type: string
 *          description: the id of the post
 *        authorId:
 *          type: string
 *          description: the user id of the author
 *        content:
 *          type: string
 *          description: the content of the post
 *        images:
 *          type: array
 *          items:
 *            type: string
 *          description: links for the images
 *        createdAt:
 *          type: Date
 *          description: when the post was created
 */
export class PostDTO {
  constructor (post: PostDTO) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
  }

  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: ExtendedPostDTO) {
    super(post)
    this.author = post.author
    this.qtyComments = post.qtyComments
    this.qtyLikes = post.qtyLikes
    this.qtyRetweets = post.qtyRetweets
  }

  author!: ExtendedUserDTO
  qtyComments!: number
  qtyLikes!: number
  qtyRetweets!: number
}
