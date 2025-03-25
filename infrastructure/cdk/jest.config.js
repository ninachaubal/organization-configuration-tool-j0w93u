module.exports = {
  // Set the test environment to Node.js since CDK is Node-based
  testEnvironment: 'node',
  
  // Look for tests in the test directory
  roots: ['<rootDir>/test'],
  
  // Pattern to identify test files
  testMatch: ['**/*.test.ts'],
  
  // Use ts-jest to transform TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  
  // File extensions that Jest should recognize
  moduleFileExtensions: ['js', 'ts'],
  
  // Files to collect coverage information from
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts'
  ],
  
  // Coverage thresholds to enforce quality standards
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Coverage report formats
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Paths to ignore when running tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/cdk.out/'
  ]
};