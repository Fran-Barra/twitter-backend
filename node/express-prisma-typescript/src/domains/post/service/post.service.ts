import { CursorPagination } from '@types'
import { CreatePostInputDTO, PostDTO } from '../dto'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  createComment: (userId: string, postId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (userId: string, postId: string) => Promise<PostDTO>
  getCommentsFromPost: (userId: string, postId: string, options: CursorPagination) => Promise<PostDTO[]>
  getLatestPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<PostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<PostDTO[]>
}
