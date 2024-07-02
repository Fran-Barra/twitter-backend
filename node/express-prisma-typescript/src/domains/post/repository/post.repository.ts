import { CursorPagination } from '@types'
import { CreatePostOrCommentInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostOrCommentInputDTO) => Promise<PostDTO>
  saveImagesLinks: (postId: string, links: string[]) => Promise<PostDTO>
  
  getAllByDatePaginated: (options: CursorPagination) => Promise<PostDTO[]>
  getAllPublicAndFollowedUsersPostByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]>

  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<ExtendedPostDTO[]>

  getCommentsFromPost: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>

}
