import { UserDTO, UserViewDTO, ExtendedUserDTO } from "../../../../src/domains/user/dto";
import { UserRepository } from "../../../../src/domains/user/repository/user.repository"
import { SignupInputDTO } from "../../../../src/domains/auth/dto/index"
import { OffsetPagination, CursorPagination } from "../../../../src/types"

export class UserRepositoryMock implements UserRepository {

    constructor(private readonly getByIdMock: Map<string, UserViewDTO> = new Map<string, UserViewDTO>()) {}

    create(data: SignupInputDTO) : Promise<UserDTO> {
        throw new Error("not implemented")
    }

    delete(userId: string) : Promise<void> {
        throw new Error("not implemented")
    }

    getRecommendedUsersPaginated(userId: string, options: OffsetPagination) : Promise<UserViewDTO[]> {
        throw new Error("not implemented")
    }

    getUsersByUsername(username: string, options: CursorPagination) : Promise<UserViewDTO[]> {
        throw new Error("not implemented")
    }

    getById(userId: string) : Promise<UserViewDTO | null> {
        let user : UserViewDTO | undefined | null= this.getByIdMock.get(userId)
        if (user === undefined) user = null
        return Promise.resolve(user)
    }

    getByEmailOrUsername(email?: string | undefined, username?: string | undefined) : Promise<ExtendedUserDTO | null> {
        throw new Error("not implemented")
    }

    setUserForGetById(userId: string, dto: UserViewDTO) {
        this.getByIdMock.set(userId, dto)
    }
}