import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { ImageService } from "./image.service";
import { Constants } from "@utils/constants";

export class AWSImageService implements ImageService {
    private readonly client;
    private readonly profilePictures = "profile-picture"

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

    async getSignedUrlForProfilePictureForRead(userId: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: Constants.S3_BUCKET_NAME,
            Key: `${this.profilePictures}/${userId}/profile.jpeg`
        }) 
        return await getSignedUrl(this.client, command)
    }
}