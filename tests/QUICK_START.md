# Quick Start Guide - Testing Infrastructure

Get up and running with LexiScan AI testing suite in 5 minutes.

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd tests
npm install
```

### 2. Configure Environment

```bash
cp .env.test .env.test.local
```

Edit `.env.test.local` with your values:
```env
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/lexiscan_test
TEST_REDIS_URL=redis://localhost:6379/1
JWT_SECRET=your-test-secret-key
```

### 3. Setup Test Database

```bash
npm run test:db:setup
npm run test:db:migrate
```

### 4. Run Tests

```bash
npm test
```

## 🎯 Common Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test type
npm run test:e2e          # End-to-end tests
npm run test:integration  # Integration tests
npm run test:unit         # Unit tests
npm run test:performance  # Performance tests

# Watch mode (auto-rerun on changes)
npm run test:watch

# Debug tests
npm run test:debug
```

## 📝 Your First Test

Create `tests/unit/services/example.service.spec.ts`:

```typescript
describe('ExampleService', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

Run it:
```bash
npm test -- example.service.spec.ts
```

## 🔧 Common Issues & Solutions

### Database Connection Error

**Error**: `Can't connect to database`

**Solution**:
```bash
# Check database is running
docker ps | grep postgres

# Or start it
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=test postgres:15

# Reset database
npm run test:db:reset
```

### Redis Connection Error

**Error**: `Redis connection refused`

**Solution**:
```bash
# Start Redis
docker run -d -p 6379:6379 redis:7

# Or use Docker Compose
cd ..
docker-compose up -d redis
```

### Tests Timing Out

**Error**: `Timeout - Async callback was not invoked`

**Solution**:
```bash
# Increase timeout
npm test -- --testTimeout=60000
```

Or in your test:
```typescript
it('slow test', async () => {
  // test code
}, 60000); // 60 second timeout
```

### Port Already in Use

**Error**: `Port 5432 already in use`

**Solution**:
```bash
# Use different port in .env.test.local
TEST_DATABASE_URL=postgresql://test:test@localhost:5433/lexiscan_test

# Or stop existing service
docker stop $(docker ps -q --filter "ancestor=postgres:15")
```

## 📚 Next Steps

1. **Read full documentation**: `tests/README.md`
2. **Explore test examples**: `tests/e2e/` and `tests/integration/`
3. **Use test factories**: Check `tests/helpers/test-factory.ts`
4. **Write your first test**: Follow patterns in existing tests

## 💡 Tips

1. **Use factories** for test data instead of creating manually
2. **Clean up** after tests to avoid side effects
3. **Mock external services** to speed up tests
4. **Test one thing** per test case
5. **Use descriptive names** for test cases

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🆘 Getting Help

- Review `tests/README.md` for detailed documentation
- Check existing tests for examples
- Ask in team chat
- Open an issue if you find a bug

---

**Ready to test?** Run `npm test` and see your tests pass! 🎉

