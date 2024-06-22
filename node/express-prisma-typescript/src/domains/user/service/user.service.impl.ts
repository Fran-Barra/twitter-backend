import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { ImageService } from '@domains/image'

export class UserServiceImpl implements UserService {
  constructor (
    private readonly repository: UserRepository,
    private readonly imageService: ImageService
  ) {}

  async getUser (userId: any): Promise<UserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return this.setProfilePictureLinkToUserDTO(user)
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return Promise.all(
      (await this.repository.getRecommendedUsersPaginated(options)).map(this.setProfilePictureLinkToUserDTO)
    )
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  private async setProfilePictureLinkToUserDTO(userDTO: UserDTO) : Promise<UserDTO> {
    const url = await this.imageService.getSignedUrlForProfilePictureForRead(userDTO.id)
    const user = new UserDTO(userDTO)
    user.profilePicture = url
    return user
  }
}
