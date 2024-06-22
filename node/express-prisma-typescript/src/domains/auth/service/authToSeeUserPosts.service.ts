export interface AuthToSeeUserPosts {
    authorized: (viewerUserId: string, viewedUsedId: string) => Promise<boolean>
}