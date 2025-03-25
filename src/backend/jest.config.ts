import type { Config } from '@jest/types'; // @jest/types version ^29.5.0

const config: Config.InitialOptions = {
  // Use ts-jest as the preset for TypeScript support
  preset: 'ts-jest',
  
  // Use node environment for backend tests
  testEnvironment: 'node',
  
  // Set root directory for tests
  roots: ['<rootDir>/src/backend'],
  
  // Configure TypeScript transformer
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/backend/**/__tests__/**/*.ts?(x)',
    '<rootDir>/src/backend/**/?(*.)+(spec|test).ts?(x)',
  ],
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/backend/api/**/*.ts',
    'src/backend/services/**/*.ts',
    'src/backend/utils/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/__tests__/**',
  ],
  
  // Coverage thresholds as per requirements
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/backend/api/': {
      branches: 85,
      functions: 95,
      lines: 90, // API Routes require 90% line coverage
      statements: 90,
    },
    './src/backend/services/': {
      branches: 85,
      functions: 95,
      lines: 90, // Services require 90% line coverage
      statements: 90,
    },
    './src/backend/utils/': {
      branches: 90,
      functions: 100,
      lines: 95, // Utilities require 95% line coverage
      statements: 95,
    },
  },
  
  // Coverage report formats
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  
  // Path aliasing for imports
  moduleNameMapper: {
    '^@/backend/(.*)$': '<rootDir>/src/backend/$1',
  },
  
  // Paths to ignore for tests
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  
  // Paths to ignore for transformations
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // Setup files for tests
  setupFilesAfterEnv: ['<rootDir>/src/backend/__tests__/setup.ts'],
};

export default config;