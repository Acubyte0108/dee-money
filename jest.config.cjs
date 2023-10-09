module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/fileMock.js",
    },
};