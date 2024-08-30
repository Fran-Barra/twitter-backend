
export interface ImageService {
    getSignedUrlForProfilePictureForPut: (userId: string) => Promise<string>
    /**
     * THIS METHOD IS DEPRECATED
     * @param userId 
     * @returns 
     */
    getSignedUrlForProfilePictureForRead: (userId: string) => Promise<string>

    generateLinkForProfilePicture: (userId: string) => string
    generateLinksForPostImages: (postId: string, amount: number) => Promise<PostLinksAndReadLinks>
}

export interface PostLinksAndReadLinks {
    post: string[]
    read: string[]
}