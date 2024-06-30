module.exports = {
    clearMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageProvider: '8v',
    coverageDirectory: "coverage",
    moduleNameMapper: {
      '^@utils' : "<rootDir>/src/utils"
    }
  }