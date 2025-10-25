/**
 * Global Test Setup
 * 
 * Configures the testing environment before tests run.
 * Includes:
 * - Environment variables
 * - Global mocks
 * - Test utilities
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({ path: resolve(__dirname, '.env.test') });

// Set default test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/lexiscan_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  generateRandomEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  generateRandomString: (length: number = 10) => Math.random().toString(36).substring(2, 2 + length),
};

// Declare global types
declare global {
  var testUtils: {
    sleep: (ms: number) => Promise<void>;
    generateRandomEmail: () => string;
    generateRandomString: (length?: number) => string;
  };
}

