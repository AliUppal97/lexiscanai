/**
 * Users E2E Tests
 * 
 * Tests complete user management flows including:
 * - User creation
 * - User retrieval
 * - User updates
 * - Profile management
 * - Password changes
 * - User deactivation
 * - Role-based access control
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { UserFactory } from '../helpers/test-factory';
import { cleanupDatabase, generateTestToken, generateTestEmail } from '../helpers/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testUser: any;
  let adminUser: any;
  let authToken: string;
  let adminToken: string;

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
    
    testUser = UserFactory.create({ role: 'USER' });
    adminUser = UserFactory.create({ role: 'ADMIN' });
    
    authToken = generateTestToken(jwtService, {
      sub: testUser.id,
      email: testUser.email,
      tenantId: testUser.tenantId,
      role: testUser.role,
    });

    adminToken = generateTestToken(jwtService, {
      sub: adminUser.id,
      email: adminUser.email,
      tenantId: adminUser.tenantId,
      role: adminUser.role,
    });
  });

  describe('POST /users', () => {
    it('should create a new user as admin', async () => {
      const createDto = {
        email: generateTestEmail(),
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createDto.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail to create user as non-admin', async () => {
      const createDto = {
        email: generateTestEmail(),
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should validate email format', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should prevent duplicate email', async () => {
      const email = generateTestEmail();

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email,
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email,
          password: 'AnotherPass123!',
          firstName: 'Jane',
          lastName: 'Doe',
        })
        .expect(409);
    });
  });

  describe('GET /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: generateTestEmail(),
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        });

      userId = response.body.id;
    });

    it('should retrieve user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail to retrieve non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401);
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      // Create multiple users
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: generateTestEmail(),
            password: 'SecurePass123!',
            firstName: `User${i}`,
            lastName: 'Test',
          });
      }
    });

    it('should list all users as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('total');
    });

    it('should fail to list users as non-admin', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.page).toBe(1);
    });

    it('should filter by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=USER')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((user: any) => {
        expect(user.role).toBe('USER');
      });
    });

    it('should filter by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((user: any) => {
        expect(user.isActive).toBe(true);
      });
    });
  });

  describe('PATCH /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: generateTestEmail(),
          password: 'SecurePass123!',
          firstName: 'Original',
          lastName: 'Name',
        });

      userId = response.body.id;
    });

    it('should update user as admin', async () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.firstName).toBe(updateDto.firstName);
      expect(response.body.lastName).toBe(updateDto.lastName);
    });

    it('should fail to update user as non-admin', async () => {
      const updateDto = {
        firstName: 'Updated',
      };

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should allow user to update own profile', async () => {
      const updateDto = {
        firstName: 'Updated',
        phone: '+1234567890',
      };

      const userToken = generateTestToken(jwtService, {
        sub: userId,
        email: 'test@example.com',
        tenantId: testUser.tenantId,
      });

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.firstName).toBe(updateDto.firstName);
      expect(response.body.phone).toBe(updateDto.phone);
    });
  });

  describe('DELETE /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: generateTestEmail(),
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        });

      userId = response.body.id;
    });

    it('should delete user as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail to delete user as non-admin', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('GET /users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testUser.id);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update own profile', async () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'Profile',
        phone: '+1234567890',
        timezone: 'America/New_York',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.firstName).toBe(updateDto.firstName);
      expect(response.body.lastName).toBe(updateDto.lastName);
      expect(response.body.phone).toBe(updateDto.phone);
    });

    it('should not allow changing role through profile update', async () => {
      const updateDto = {
        role: 'ADMIN', // Should be ignored or rejected
      };

      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('POST /users/me/change-password', () => {
    const originalPassword = 'SecurePass123!';
    const newPassword = 'NewSecurePass456!';

    it('should change password successfully', async () => {
      await request(app.getHttpServer())
        .post('/users/me/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword,
        })
        .expect(200);

      // Verify can login with new password
      // (This would require logging in again with the new password)
    });

    it('should fail with incorrect current password', async () => {
      await request(app.getHttpServer())
        .post('/users/me/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: newPassword,
        })
        .expect(400);
    });

    it('should validate new password strength', async () => {
      await request(app.getHttpServer())
        .post('/users/me/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: '123', // Too weak
        })
        .expect(400);
    });
  });

  describe('Multi-tenant User Isolation', () => {
    let tenant1Admin: any;
    let tenant2Admin: any;
    let tenant1Token: string;
    let tenant2Token: string;
    let tenant1UserId: string;

    beforeEach(async () => {
      tenant1Admin = UserFactory.create({ tenantId: 'tenant-1', role: 'ADMIN' });
      tenant2Admin = UserFactory.create({ tenantId: 'tenant-2', role: 'ADMIN' });

      tenant1Token = generateTestToken(jwtService, {
        sub: tenant1Admin.id,
        email: tenant1Admin.email,
        tenantId: tenant1Admin.tenantId,
        role: tenant1Admin.role,
      });

      tenant2Token = generateTestToken(jwtService, {
        sub: tenant2Admin.id,
        email: tenant2Admin.email,
        tenantId: tenant2Admin.tenantId,
        role: tenant2Admin.role,
      });

      // Create user in tenant 1
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          email: generateTestEmail(),
          password: 'SecurePass123!',
          firstName: 'Tenant1',
          lastName: 'User',
        });

      tenant1UserId = response.body.id;
    });

    it('should prevent access to users from other tenants', async () => {
      await request(app.getHttpServer())
        .get(`/users/${tenant1UserId}`)
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(404);
    });

    it('should only list users from own tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      // Tenant 2 should have no users except the admin
      expect(response.body.data.length).toBe(0);
    });
  });
});

