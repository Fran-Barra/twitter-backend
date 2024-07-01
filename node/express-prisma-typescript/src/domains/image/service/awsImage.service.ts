import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { ImageService, PostLinksAndReadLinks } from "./image.service";
import { Constants } from "@utils/constants";

export class AWSImageService implements ImageService {
    private readonly client;
    private readonly profilePictures = "profile-picture"
    private readonly postImages = "post"

    constructor() {        
        this.client = new S3Client({
            region: Constants.S3_REGION,
            credentials: {
                secretAccessKey: Constants.S3_SECRET_KEY,
                accessKeyId: Constants.S3_ID_KEY,
            }
        }) 
    }

    async getSignedUrlForProfilePictureForPut(userId: string) : Promise<string> {
        const command = new PutObjectCommand({
            Bucket: Constants.S3_BUCKET_NAME,
            Key: `${this.profilePictures}/${userId}/profile.jpeg`,
            ContentType: "image/jpeg"
        }) 
        return await getSignedUrl(this.client, command, {expiresIn: 120})
    }

    //TODO: manage no profile picture
    async getSignedUrlForProfilePictureForRead(userId: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: Constants.S3_BUCKET_NAME,
            Key: `${this.profilePictures}/${userId}/profile.jpeg`
        }) 
        return await getSignedUrl(this.client, command)
    }

    async generateLinksForPostImages(postId: string, amount: number) : Promise<PostLinksAndReadLinks> {
        const links = new Array(amount);
        const post = new Array(amount);

        for (let i = 0; i<amount; i++) {
            const key = `post/${postId}/picture${i}.jpeg`
            const command = new PutObjectCommand({
                Bucket: Constants.S3_BUCKET_NAME,
                Key: key,
                ContentType: "image/jpeg",
            })
            post[i] = getSignedUrl(this.client, command)
            links[i] = this.buildUrl(key)
        }
        
        return {
            post: await Promise.all(post),
            read: links
        }
    }

    private buildUrl(key: string) : string {
        return `https://${Constants.S3_BUCKET_NAME}.s3.${Constants.S3_REGION}.amazonaws.com/${key}`
    }
}