
export interface ImageService {
    getSignedUrlForProfilePictureForPut: (userId: string) => Promise<string>
    getSignedUrlForProfilePictureForRead: (userId: string) => Promise<string>

    generateLinksForPostImages: (postId: string, amount: number) => Promise<PostLinksAndReadLinks>
}

export interface PostLinksAndReadLinks {
    post: string[]
    read: string[]
}