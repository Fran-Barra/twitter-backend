
export interface ImageService {
    getSignedUrlForProfilePictureForPut: (userId: string) => Promise<string>
    getSignedUrlForProfilePictureForRead: (userId: string) => Promise<string>
}