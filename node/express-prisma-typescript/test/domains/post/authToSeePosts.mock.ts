import { AuthToSeeUserPosts } from "../../../src/domains/auth/service/authToSeeUserPosts.service"

export class AuthToSeeUserPostsMock implements AuthToSeeUserPosts {
    constructor(private result: boolean = true) {}

    authorized(viewerUserId: string, viewedUsedId: string) : Promise<boolean> {
        return Promise.resolve(this.result)
    }

    setResult(result: boolean) {
        this.result = result
    }
}