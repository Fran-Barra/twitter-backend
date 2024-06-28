import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import { db } from "../src/utils/database"

jest.mock("../src/utils/database", () => {
  const originalModule = jest.requireActual("../src/utils/database")
  return {
    __esModule: true,
    ...originalModule,
    db: mockDeep<PrismaClient>()
  }
})

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = db as unknown as DeepMockProxy<PrismaClient>