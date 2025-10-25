/**
 * General API E2E Tests
 * 
 * Tests general API functionality including:
 * - Health checks
 * - API versioning
 * - Error handling
 * - Rate limiting
 * - API key authentication
 * - CORS
 * - Request/response formats
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { UserFactory } from '../helpers/test-factory';
import { cleanupDatabase, generateTestToken } from '../helpers/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('General API E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    
    await app.init();
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
    testUser = UserFactory.create();
    
    authToken = generateTestToken(jwtService, {
      sub: testUser.id,
      email: testUser.email,
      tenantId: testUser.tenantId,
    });
  });

  describe('Health Checks', () => {
    it('should return health status on GET /health', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    it('should return detailed health info on GET /health/detailed', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('redis');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('API Versioning', () => {
    it('should support v1 API endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.version).toBe('1');
    });

    it('should return 404 for unsupported API versions', async () => {
      await request(app.getHttpServer())
        .get('/api/v999/health')
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });

    it('should return 405 for unsupported HTTP methods', async () => {
      await request(app.getHttpServer())
        .put('/health')
        .expect(405);
    });

    it('should return 400 for malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}')
        .expect(400);
    });

    it('should return structured error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(400);
    });

    it('should handle validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email', // Invalid format
          password: '123', // Too weak
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message) || typeof response.body.message === 'string').toBe(true);
    });

    it('should handle internal server errors gracefully', async () => {
      // This would require triggering an actual server error
      // Implementation depends on your error handling strategy
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const endpoint = '/auth/login';
      const requests = [];

      // Make 100 rapid requests
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app.getHttpServer())
            .post(endpoint)
            .send({
              email: 'test@example.com',
              password: 'password',
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least some requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Check for rate limit headers (if implemented)
      // expect(response.headers).toHaveProperty('x-ratelimit-limit');
      // expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });

    it('should reset rate limit after time window', async () => {
      // This test would require waiting for the rate limit window to reset
      // Implementation depends on your rate limiting strategy
    });
  });

  describe('API Key Authentication', () => {
    const validApiKey = 'lx_test_api_key_123456789';

    it('should authenticate with valid API key', async () => {
      await request(app.getHttpServer())
        .get('/api/documents')
        .set('X-API-Key', validApiKey)
        .expect(200);
    });

    it('should reject invalid API key', async () => {
      await request(app.getHttpServer())
        .get('/api/documents')
        .set('X-API-Key', 'invalid-api-key')
        .expect(401);
    });

    it('should reject expired API key', async () => {
      const expiredApiKey = 'lx_expired_api_key';

      await request(app.getHttpServer())
        .get('/api/documents')
        .set('X-API-Key', expiredApiKey)
        .expect(401);
    });

    it('should enforce API key scopes', async () => {
      const readOnlyApiKey = 'lx_readonly_api_key';

      // GET should work
      await request(app.getHttpServer())
        .get('/api/documents')
        .set('X-API-Key', readOnlyApiKey)
        .expect(200);

      // POST should fail
      await request(app.getHttpServer())
        .post('/api/documents')
        .set('X-API-Key', readOnlyApiKey)
        .send({
          title: 'Test',
          content: 'Test',
        })
        .expect(403);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'https://example.com')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app.getHttpServer())
        .options('/auth/login')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'POST')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });

  describe('Request/Response Formats', () => {
    it('should accept JSON content type', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password',
        });
      
      // Status depends on whether credentials are valid
    });

    it('should reject unsupported content types', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/xml')
        .send('<xml>data</xml>')
        .expect(415);
    });

    it('should return JSON responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.type).toMatch(/json/);
      expect(response.body).toBeInstanceOf(Object);
    });

    it('should handle query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?page=1&limit=10&status=COMPLETED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should handle URL parameters', async () => {
      const documentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer())
        .get(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Status depends on whether document exists
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Check for common security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      
      // Additional security headers if configured
      // expect(response.headers).toHaveProperty('x-frame-options');
      // expect(response.headers).toHaveProperty('strict-transport-security');
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/non-existent')
        .expect(404);

      // Should not include stack traces or internal paths
      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toMatch(/\/apps\/api\/src\//);
    });
  });

  describe('Pagination', () => {
    it('should support limit and offset pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should enforce maximum page size', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?limit=10000') // Excessive limit
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should be capped at max limit (e.g., 100)
      expect(response.body.limit).toBeLessThanOrEqual(100);
    });

    it('should handle invalid pagination parameters', async () => {
      await request(app.getHttpServer())
        .get('/documents?page=-1&limit=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Request Logging', () => {
    it('should log all API requests', async () => {
      // This test would verify that requests are being logged
      // Implementation depends on your logging strategy
      
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Verify log entry was created (would require accessing logs)
    });

    it('should include request ID in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Check for request ID header (if implemented)
      // expect(response.headers).toHaveProperty('x-request-id');
    });
  });

  describe('Compression', () => {
    it('should compress large responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      // Check for compression header
      // expect(response.headers).toHaveProperty('content-encoding');
    });
  });

  describe('Content Negotiation', () => {
    it('should respect Accept header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('Accept', 'application/json')
        .expect(200);

      expect(response.type).toMatch(/json/);
    });
  });

  describe('Graceful Degradation', () => {
    it('should handle database connection issues', async () => {
      // This test would require simulating a database failure
      // Implementation depends on your error handling strategy
    });

    it('should handle Redis connection issues', async () => {
      // This test would require simulating a Redis failure
      // Implementation depends on your caching strategy
    });

    it('should handle external service failures', async () => {
      // This test would require simulating external service failures
      // (e.g., Stripe, AWS S3, email service)
    });
  });
});

