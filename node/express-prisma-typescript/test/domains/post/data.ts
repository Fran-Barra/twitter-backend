
const time = new Date()
export const postPrismaMock = {
    id: "1",
    authorId: "2",
    content: "hi",
    images: new Array<string>(),
    createdAt: time,
    updatedAt: new Date(),
    deletedAt: null,
    commentedPostId: null,
    qtyLikes: 0,
    qtyRetweets: 0,
    qtyComments: 0
}

export const commentPrismaMock = {
    id: "3",
    authorId: "2",
    content: "nice post",
    images: new Array<string>(),
    createdAt: time,
    updatedAt: new Date(),
    deletedAt: null,
    commentedPostId: "1",
    qtyLikes: 0,
    qtyRetweets: 0,
    qtyComments: 0
}