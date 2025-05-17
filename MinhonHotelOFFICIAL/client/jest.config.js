module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^@assets/(.*)$': '<rootDir>/../attached_assets/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
}; 