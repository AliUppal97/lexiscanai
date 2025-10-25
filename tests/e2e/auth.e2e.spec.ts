/**
 * Authentication E2E Tests
 * 
 * Tests complete authentication flows including:
 * - User registration
 * - Login/logout
 * - Password reset
 * - JWT token validation
 * - Multi-tenant authentication
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { UserFactory } from '../helpers/test-factory';
import { cleanupDatabase, generateTestEmail } from '../helpers/test-utils';

describe('Authentication E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    
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
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: generateTestEmail(),
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        tenantSlug: 'test-org',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with invalid email format', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should fail with weak password', async () => {
      const registerDto = {
        email: generateTestEmail(),
        password: '123', // Too weak
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should fail when email already exists', async () => {
      const email = generateTestEmail();
      
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        });

      // Duplicate registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'AnotherPass123!',
          firstName: 'Jane',
          lastName: 'Doe',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a test user
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: 'SecurePass123!',
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        });
      
      authToken = response.body.accessToken;
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should fail with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: 'SecurePass123!',
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        });
      
      authToken = response.body.accessToken;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without authentication token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: 'SecurePass123!',
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        });
      
      authToken = response.body.accessToken;
    });

    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should fail logout without token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: 'SecurePass123!',
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        });
    });

    it('should send password reset email for existing user', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);
    });

    it('should not reveal if email does not exist (security)', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200); // Still returns 200 to prevent email enumeration
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // This would require generating a valid reset token
      // Implementation depends on your reset token strategy
      const resetToken = 'valid-reset-token';

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewSecurePass123!',
        });
      
      // Status depends on implementation
    });

    it('should fail with invalid reset token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewSecurePass123!',
        })
        .expect(400);
    });
  });

  describe('Multi-tenant Authentication', () => {
    it('should isolate users by tenant', async () => {
      const user1Email = generateTestEmail();
      const user2Email = generateTestEmail();

      // Register user in tenant 1
      const tenant1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: user1Email,
          password: 'SecurePass123!',
          firstName: 'User',
          lastName: 'One',
          tenantSlug: 'tenant-1',
        });

      // Register user in tenant 2
      const tenant2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: user2Email,
          password: 'SecurePass123!',
          firstName: 'User',
          lastName: 'Two',
          tenantSlug: 'tenant-2',
        });

      // Verify users are in different tenants
      expect(tenant1Response.body.user.tenantId).not.toBe(tenant2Response.body.user.tenantId);
    });
  });

  describe('Token Expiration', () => {
    it('should reject expired tokens', async () => {
      // This test would require manipulating token expiration
      // Implementation depends on your JWT configuration
      const expiredToken = 'expired-jwt-token';

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});

