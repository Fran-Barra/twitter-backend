import { AWSImageService } from "./service/awsImage.service"
import { ImageService } from "./service/image.service"

export * from "./service/image.service"
export const imageService : ImageService = new AWSImageService()