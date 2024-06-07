/**
 * @swagger
 * components:
 *  schemas:
 *    UserDTO:
 *      tags:
 *        - user
 *      properties:
 *        id:
 *          type: string
 *          description: the id of the user
 *        name:
 *          type: string
 *          description: the user name
 *        createdAt:
 *          type: Date
 *          description: when the user was created
 *        private:
 *          type: boolean
 *          description: if the user is private
 */
export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.private = user.private
  }

  id: string
  name: string | null
  createdAt: Date
  private: boolean
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string
  username: string
  profilePicture: string | null
}
