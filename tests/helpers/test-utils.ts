/**
 * Test Utilities
 * 
 * Common utility functions for testing.
 */

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../apps/api/src/common/prisma.service';

/**
 * Create a test application instance
 */
export async function createTestApp(moduleMetadata: any): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule(moduleMetadata).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

/**
 * Generate JWT token for testing
 */
export function generateTestToken(jwtService: JwtService, payload: any = {}): string {
  const defaultPayload = {
    sub: 'test-user-id',
    email: 'test@example.com',
    tenantId: 'test-tenant-id',
    role: 'USER',
    ...payload,
  };

  return jwtService.sign(defaultPayload);
}

/**
 * Make authenticated request
 */
export function authenticatedRequest(app: INestApplication, token: string) {
  return {
    get: (url: string) => request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app.getHttpServer()).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app.getHttpServer()).put(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request(app.getHttpServer()).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app.getHttpServer()).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Clean up database after tests
 */
export async function cleanupDatabase(prisma: PrismaService) {
  // Delete in order to respect foreign key constraints
  await prisma.$executeRaw`TRUNCATE TABLE "Review" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Invoice" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Subscription" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ApiKey" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Webhook" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "AuditLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Notification" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "OrganizationMember" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Organization" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
}

/**
 * Wait for condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Mock file upload
 */
export function createMockFile(filename: string = 'test.pdf', size: number = 1024): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'application/pdf',
    size,
    buffer: Buffer.from('test file content'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };
}

/**
 * Expect to throw async
 */
export async function expectToThrow(fn: () => Promise<any>, errorMessage?: string): Promise<void> {
  let didThrow = false;

  try {
    await fn();
  } catch (error) {
    didThrow = true;
    if (errorMessage) {
      expect(error.message).toContain(errorMessage);
    }
  }

  expect(didThrow).toBe(true);
}

/**
 * Sleep utility
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random test email
 */
export const generateTestEmail = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};

/**
 * Generate random test string
 */
export const generateTestString = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

