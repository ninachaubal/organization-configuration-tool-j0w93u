import type { Config } from '@jest/types'; // v29.5.0

/**
 * Jest configuration for the Organization Configuration Management Tool web frontend.
 * This configures the testing environment, file patterns, coverage thresholds,
 * and other Jest-specific settings to ensure proper testing of React components,
 * hooks, and utilities.
 */
const config: Config.InitialOptions = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Use jsdom environment for React component testing
  testEnvironment: 'jsdom',
  
  // Look for tests in the web directory
  roots: ['<rootDir>/src/web'],
  
  // Configure TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  
  // File extensions Jest should recognize
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Patterns to match test files
  testMatch: [
    '<rootDir>/src/web/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/web/**/*.{spec,test}.{ts,tsx}'
  ],
  
  // Files to include in coverage calculations
  collectCoverageFrom: [
    'src/web/components/**/*.{ts,tsx}',
    'src/web/hooks/**/*.{ts,tsx}',
    'src/web/utils/**/*.{ts,tsx}',
    '!src/web/**/*.d.ts',
    '!src/web/**/*.stories.{ts,tsx}',
    '!**/node_modules/**',
  ],
  
  // Define coverage thresholds based on requirements
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // UI Components: 80% line coverage
    'src/web/components/ui/**/*.{ts,tsx}': {
      branches: 70,
      functions: 85,
      lines: 80,
      statements: 80,
    },
    // Utilities: 95% line coverage
    'src/web/utils/**/*.{ts,tsx}': {
      branches: 90,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    // Hooks: 90% line coverage for hooks
    'src/web/hooks/**/*.{ts,tsx}': {
      branches: 85,
      functions: 95,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage report formats
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  
  // Module name mapping for imports
  moduleNameMapper: {
    // Handle CSS imports
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/web/__mocks__/fileMock.js',
    // Handle module path aliases
    '^@/(.*)$': '<rootDir>/src/web/$1',
  },
  
  // Paths to ignore when looking for tests
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  
  // Don't transform certain dependencies
  transformIgnorePatterns: [
    '/node_modules/(?!(@(?!node)).*)',
  ],
  
  // Setup files to run after Jest is initialized
  // This will include React Testing Library and MSW setup
  setupFilesAfterEnv: [
    '<rootDir>/src/web/setupTests.ts',
  ],
};

export default config;