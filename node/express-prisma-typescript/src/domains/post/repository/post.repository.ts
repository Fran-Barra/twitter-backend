import { CursorPagination } from '@types'
import { CreatePostOrCommentInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostOrCommentInputDTO) => Promise<PostDTO>
  
  getAllByDatePaginated: (options: CursorPagination) => Promise<PostDTO[]>
  getAllPublicAndFollowedUsersPostByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]>

  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>

  getCommentsFromPost: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>

}
