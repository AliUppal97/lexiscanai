/**
 * Jest Configuration for LexiScan AI Testing Suite
 * 
 * Configures test environments for:
 * - Unit tests
 * - Integration tests
 * - E2E tests
 * - Performance tests
 */

module.exports = {
  // Use ts-jest for TypeScript support
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Root directory for tests
  roots: ['<rootDir>'],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    '../apps/api/src/**/*.{js,ts}',
    '!../apps/api/src/**/*.d.ts',
    '!../apps/api/src/**/*.interface.ts',
    '!../apps/api/src/**/*.module.ts',
    '!../apps/api/src/main.ts',
  ],
  
  // Coverage thresholds for enterprise standards
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../apps/api/src/$1',
    '^@test/(.*)$': '<rootDir>/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  
  // Test timeout (30 seconds for integration/e2e tests)
  testTimeout: 30000,
  
  // Global setup/teardown
  globalSetup: '<rootDir>/global-setup.ts',
  globalTeardown: '<rootDir>/global-teardown.ts',
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  
  // Verbose output
  verbose: true,
  
  // Detect open handles (memory leaks)
  detectOpenHandles: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Max workers for parallel execution
  maxWorkers: '50%',
};

