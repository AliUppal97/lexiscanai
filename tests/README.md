# LexiScan AI - Testing Infrastructure

Comprehensive testing suite for enterprise-level SaaS application following industry best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## 🎯 Overview

This testing infrastructure provides comprehensive coverage across:

- **E2E Tests**: Complete user flows and API integration
- **Integration Tests**: External services (Database, Storage, Email, Stripe)
- **Unit Tests**: Individual components and business logic
- **Performance Tests**: Load testing and stress testing

### Coverage Goals

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 📁 Test Structure

```
tests/
├── e2e/                           # End-to-end tests
│   ├── auth.e2e.spec.ts          # Authentication flows
│   ├── documents.e2e.spec.ts     # Document management
│   ├── billing.e2e.spec.ts       # Billing & subscriptions
│   ├── users.e2e.spec.ts         # User management
│   └── api.e2e.spec.ts           # General API tests
│
├── integration/                   # Integration tests
│   ├── database.integration.spec.ts    # Database operations
│   ├── storage.integration.spec.ts     # File storage
│   ├── email.integration.spec.ts       # Email service
│   └── stripe.integration.spec.ts      # Payment processing
│
├── unit/                          # Unit tests
│   ├── services/                  # Service tests
│   │   ├── encryption.service.spec.ts
│   │   └── cache.service.spec.ts
│   ├── controllers/               # Controller tests
│   └── utils/                     # Utility function tests
│
├── performance/                   # Performance tests
│   ├── load-testing.spec.ts      # Load/throughput tests
│   └── stress-testing.spec.ts    # Stress/breaking point tests
│
├── helpers/                       # Test utilities
│   ├── test-factory.ts           # Data factories
│   ├── test-utils.ts             # Helper functions
│   └── mock-services.ts          # Service mocks
│
├── jest.config.js                 # Jest configuration
├── setup.ts                       # Global test setup
├── global-setup.ts               # Pre-test initialization
├── global-teardown.ts            # Post-test cleanup
└── .env.test                     # Test environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (for integration tests)
- Redis (for cache tests)
- Docker (optional, for isolated test environment)

### Installation

```bash
# Install dependencies
npm install

# Install test dependencies
npm install --save-dev @types/jest @types/supertest jest ts-jest supertest @faker-js/faker

# Set up test database
npm run test:db:setup

# Run migrations
npm run test:db:migrate
```

### Environment Setup

Copy `.env.test` and configure:

```bash
cp .env.test .env.test.local
```

Key variables:
- `TEST_DATABASE_URL`: Test database connection
- `TEST_REDIS_URL`: Redis for cache tests
- `STRIPE_SECRET_KEY`: Stripe test mode key
- `JWT_SECRET`: Test JWT secret

## 🧪 Running Tests

### All Tests

```bash
npm test
```

### By Type

```bash
# E2E tests only
npm run test:e2e

# Integration tests only
npm run test:integration

# Unit tests only
npm run test:unit

# Performance tests only
npm run test:performance
```

### Specific Test File

```bash
npm test -- auth.e2e.spec.ts
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Debug Mode

```bash
npm test -- --detectOpenHandles --forceExit
```

## 📊 Test Types

### E2E Tests (End-to-End)

Test complete user flows through the API.

**Example:**
```typescript
describe('User Registration Flow', () => {
  it('should register, verify email, and login', async () => {
    // Register
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({ email, password, firstName, lastName });

    // Verify email
    const verifyResponse = await request(app)
      .get(`/auth/verify/${token}`);

    // Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email, password });

    expect(loginResponse.body).toHaveProperty('accessToken');
  });
});
```

**When to use:**
- Testing complete workflows
- Verifying API contracts
- Testing authentication/authorization
- Validating business logic across modules

### Integration Tests

Test interactions with external services.

**Example:**
```typescript
describe('Stripe Integration', () => {
  it('should create customer and subscription', async () => {
    const customer = await stripeService.createCustomer({
      email: 'test@example.com',
      name: 'Test User',
    });

    const subscription = await stripeService.createSubscription({
      customerId: customer.id,
      priceId: 'price_professional',
    });

    expect(subscription.status).toBe('active');
  });
});
```

**When to use:**
- Testing database operations
- Verifying cloud storage uploads
- Testing email delivery
- Validating payment processing

### Unit Tests

Test individual functions and classes in isolation.

**Example:**
```typescript
describe('EncryptionService', () => {
  it('should encrypt and decrypt data', () => {
    const data = 'sensitive data';
    const encrypted = service.encrypt(data);
    const decrypted = service.decrypt(encrypted);

    expect(decrypted).toBe(data);
  });
});
```

**When to use:**
- Testing pure functions
- Validating algorithms
- Testing error handling
- Verifying edge cases

### Performance Tests

Test system behavior under load.

**Example:**
```typescript
describe('Load Testing', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      request(app).get('/health')
    );

    const responses = await Promise.all(requests);
    
    expect(responses.every(r => r.status === 200)).toBe(true);
  });
});
```

**When to use:**
- Establishing performance baselines
- Finding system bottlenecks
- Verifying scalability
- Testing under stress conditions

## ✍️ Writing Tests

### Using Test Factories

```typescript
import { UserFactory, DocumentFactory } from '../helpers/test-factory';

// Create single instance
const user = UserFactory.create();
const user = UserFactory.create({ role: 'ADMIN' }); // With overrides

// Create multiple instances
const users = UserFactory.createMany(10);
```

### Using Test Utilities

```typescript
import { generateTestToken, cleanupDatabase } from '../helpers/test-utils';

// Generate JWT token
const token = generateTestToken(jwtService, { sub: userId });

// Cleanup database
await cleanupDatabase(prisma);

// Authenticated requests
const response = await authenticatedRequest(app, token)
  .get('/documents');
```

### Using Mock Services

```typescript
import { mockEmailService, resetAllMocks } from '../helpers/mock-services';

describe('NotificationService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should send email notification', async () => {
    await notificationService.notify({ type: 'email' });

    expect(mockEmailService.sendEmail).toHaveBeenCalled();
  });
});
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
        env:
          TEST_DATABASE_URL: postgres://postgres:test@localhost:5432/test
          TEST_REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Docker Compose (Local)

```yaml
version: '3.8'

services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: lexiscan_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"

  test-redis:
    image: redis:7
    ports:
      - "6380:6379"
```

Run with:
```bash
docker-compose up -d
npm test
```

## 🎯 Best Practices

### 1. Test Isolation

```typescript
describe('UserService', () => {
  beforeEach(async () => {
    await cleanupDatabase(prisma);
  });

  // Each test starts with clean state
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad
it('test user', () => {});

// ✅ Good
it('should create user with hashed password', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should update user profile', async () => {
  // Arrange
  const user = await createTestUser();
  const updates = { firstName: 'Updated' };

  // Act
  const result = await userService.update(user.id, updates);

  // Assert
  expect(result.firstName).toBe('Updated');
});
```

### 4. Test One Thing

```typescript
// ❌ Bad - tests multiple concerns
it('should register, login, and update profile', () => {});

// ✅ Good - focused tests
it('should register new user', () => {});
it('should login with valid credentials', () => {});
it('should update user profile', () => {});
```

### 5. Use Meaningful Assertions

```typescript
// ❌ Bad
expect(user).toBeTruthy();

// ✅ Good
expect(user).toHaveProperty('id');
expect(user.email).toBe('test@example.com');
expect(user.isActive).toBe(true);
```

### 6. Handle Async Properly

```typescript
// ❌ Bad - missing await
it('should create user', () => {
  userService.create(data); // Not awaited!
  expect(user).toBeDefined();
});

// ✅ Good
it('should create user', async () => {
  const user = await userService.create(data);
  expect(user).toBeDefined();
});
```

### 7. Clean Up Resources

```typescript
describe('FileService', () => {
  const testFiles: string[] = [];

  afterEach(async () => {
    // Clean up test files
    for (const file of testFiles) {
      await fs.unlink(file);
    }
    testFiles.length = 0;
  });
});
```

### 8. Mock External Dependencies

```typescript
jest.mock('@aws-sdk/client-s3');

describe('StorageService', () => {
  it('should upload file', async () => {
    const mockUpload = jest.fn().mockResolvedValue({ Key: 'file.pdf' });
    
    // Test with mock
  });
});
```

### 9. Test Error Cases

```typescript
it('should throw error for invalid email', async () => {
  await expect(
    userService.create({ email: 'invalid' })
  ).rejects.toThrow('Invalid email format');
});
```

### 10. Use Timeouts Appropriately

```typescript
// For slow operations
it('should process large file', async () => {
  await processLargeFile();
}, 30000); // 30 second timeout
```

## 📈 Monitoring Test Health

### Coverage Reports

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Test Duration

```bash
npm test -- --verbose
```

### Flaky Test Detection

```bash
npm test -- --maxWorkers=1 --runInBand
```

## 🐛 Debugging Tests

### VS Code Configuration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Issues

**Tests timing out:**
```bash
# Increase timeout
npm test -- --testTimeout=30000
```

**Database connection issues:**
```bash
# Check database is running
psql -h localhost -U test -d lexiscan_test

# Reset database
npm run test:db:reset
```

**Memory leaks:**
```bash
# Run with heap profiling
node --expose-gc --max-old-space-size=4096 node_modules/.bin/jest
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns
2. Add to appropriate test category
3. Update this README if needed
4. Ensure tests pass in CI
5. Maintain coverage standards

## 📞 Support

For questions or issues:
- Check existing tests for examples
- Review this documentation
- Ask in team chat
- Open an issue in repository

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Engineering Team

