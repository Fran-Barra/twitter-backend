import { NotFoundException } from '@utils/errors'
import { CursorPagination, OffsetPagination } from 'types'
import { UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { ImageService } from '@domains/image'

export class UserServiceImpl implements UserService {
  constructor (
    private readonly repository: UserRepository,
    private readonly imageService: ImageService
  ) {}

  async getUser (userId: any): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return this.setProfilePictureLinkToUserDTO(user)
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return Promise.all(
      (await this.repository.getRecommendedUsersPaginated(options)).map(this.setProfilePictureLinkToUserDTO.bind(this))
    )
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async getUsersByName(username: string, options: CursorPagination): Promise<UserViewDTO[]> {
    const users = await this.repository.getUsersByUsername(username, options)    
    return Promise.all(
      users.map(this.setProfilePictureLinkToUserDTO.bind(this))
    )
  }

  private async setProfilePictureLinkToUserDTO(userDTO: UserViewDTO) : Promise<UserViewDTO> {    
    const url = await this.imageService.getSignedUrlForProfilePictureForRead(userDTO.id)
    userDTO.profilePicture = url
    return userDTO
  }
}
