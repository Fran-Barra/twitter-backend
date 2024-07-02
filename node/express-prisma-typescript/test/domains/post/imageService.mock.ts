import { ImageService, PostLinksAndReadLinks } from "../../../src/domains/image/service/image.service"

export class ImageServiceMock implements ImageService {
    constructor(
        private readonly profilePostUrl: string = "http://localhost:8080/mock/profile-post",
        private readonly profileReadUrl: string = "http://localhost:8080/mock/profile-read",
        private readonly baseUrlForPost: string = "http://localhost:8080/mock/post"

    ) {}


    getSignedUrlForProfilePictureForPut(userId: string) : Promise<string> {
        return Promise.resolve(this.profilePostUrl);
    }

    getSignedUrlForProfilePictureForRead(userId: string) : Promise<string> {
        return Promise.resolve(this.profileReadUrl)
    }

    generateLinksForPostImages(postId: string, amount: number) : Promise<PostLinksAndReadLinks> {
        const array : string[] = new Array(amount);
        for (let i = 0; i < amount; i++) {
            array[i] = this.baseUrlForPost + `${postId}/${i}`
        }
        return Promise.resolve({
            post: array,
            read: array
        })
    }
}