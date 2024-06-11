import { CursorPagination } from '@types'
import { CreatePostOrCommentInputDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostOrCommentInputDTO) => Promise<PostDTO>
  
  getAllByDatePaginated: (options: CursorPagination) => Promise<PostDTO[]>
  getAllPublicAndFollowedUsersPostByDatePaginated(userId: string, options: CursorPagination): Promise<PostDTO[]>

  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>

  getUserPrivacyById(userId: string) : Promise<{private: Boolean} | null>
  userFollows(follower: string, followed: string): Promise<Boolean>
}
