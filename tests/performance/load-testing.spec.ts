/**
 * Load Testing Suite
 * 
 * Tests system performance under normal and peak load conditions:
 * - API endpoint throughput
 * - Database query performance
 * - Concurrent user handling
 * - Response time metrics
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { generateTestToken, cleanupDatabase } from '../helpers/test-utils';
import { UserFactory } from '../helpers/test-factory';
import { JwtService } from '@nestjs/jwt';

describe('Load Testing', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    
    await app.init();
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe('API Endpoint Performance', () => {
    it('should handle 100 concurrent GET requests', async () => {
      const requests = Array.from({ length: 100 }, () =>
        request(app.getHttpServer()).get('/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All requests should succeed
      expect(responses.every(r => r.status === 200)).toBe(true);
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      
      // Calculate throughput
      const throughput = 100 / (duration / 1000);
      console.log(`Throughput: ${throughput.toFixed(2)} requests/second`);
      
      // Should handle at least 20 requests per second
      expect(throughput).toBeGreaterThan(20);
    }, 10000);

    it('should handle 1000 requests over 30 seconds', async () => {
      const requestsPerSecond = 33; // ~1000 requests / 30 seconds
      const totalRequests = 1000;
      const responseTimes: number[] = [];
      let successCount = 0;

      const startTime = Date.now();

      for (let i = 0; i < totalRequests; i++) {
        const reqStartTime = Date.now();
        
        const response = await request(app.getHttpServer())
          .get('/health');

        const reqDuration = Date.now() - reqStartTime;
        responseTimes.push(reqDuration);

        if (response.status === 200) {
          successCount++;
        }

        // Control request rate
        if (i % requestsPerSecond === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const totalDuration = Date.now() - startTime;

      // Calculate metrics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
      const successRate = (successCount / totalRequests) * 100;

      console.log(`Load Test Results:`);
      console.log(`Total Duration: ${totalDuration}ms`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`P95 Response Time: ${p95ResponseTime}ms`);

      // Assertions
      expect(successRate).toBeGreaterThan(99); // 99% success rate
      expect(avgResponseTime).toBeLessThan(200); // 200ms average
      expect(p95ResponseTime).toBeLessThan(500); // 500ms for 95th percentile
    }, 60000);

    it('should handle authenticated requests under load', async () => {
      const user = UserFactory.create();
      const token = generateTestToken(jwtService, {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
      });

      const requests = Array.from({ length: 50 }, () =>
        request(app.getHttpServer())
          .get('/documents')
          .set('Authorization', `Bearer ${token}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All should succeed (200 or 404 is acceptable)
      expect(responses.every(r => [200, 404].includes(r.status))).toBe(true);
      
      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    }, 15000);
  });

  describe('Database Query Performance', () => {
    beforeEach(async () => {
      await cleanupDatabase(prisma);
      
      // Seed database with test data
      await prisma.user.createMany({
        data: Array.from({ length: 100 }, (_, i) => ({
          email: `loadtest${i}@example.com`,
          firstName: `User${i}`,
          lastName: 'LoadTest',
          passwordHash: 'hashed',
          tenantId: 'load-test-tenant',
        })),
      });
    });

    it('should efficiently query large datasets', async () => {
      const startTime = Date.now();

      const users = await prisma.user.findMany({
        where: { tenantId: 'load-test-tenant' },
        take: 50,
      });

      const duration = Date.now() - startTime;

      expect(users.length).toBe(50);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle concurrent database queries', async () => {
      const queries = Array.from({ length: 20 }, () =>
        prisma.user.findMany({
          where: { tenantId: 'load-test-tenant' },
          take: 10,
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(queries);
      const duration = Date.now() - startTime;

      expect(results.every(r => r.length === 10)).toBe(true);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should efficiently handle pagination', async () => {
      const pageSize = 10;
      const totalPages = 10;
      const responseTimes: number[] = [];

      for (let page = 0; page < totalPages; page++) {
        const startTime = Date.now();

        await prisma.user.findMany({
          where: { tenantId: 'load-test-tenant' },
          skip: page * pageSize,
          take: pageSize,
        });

        responseTimes.push(Date.now() - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`Pagination Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
      
      // Pagination should be consistent across pages
      expect(avgResponseTime).toBeLessThan(200);
    });

    it('should handle complex joins efficiently', async () => {
      // Create users with documents
      const user = await prisma.user.create({
        data: {
          email: 'jointest@example.com',
          firstName: 'Join',
          lastName: 'Test',
          passwordHash: 'hashed',
          tenantId: 'join-tenant',
        },
      });

      await prisma.document.createMany({
        data: Array.from({ length: 50 }, (_, i) => ({
          title: `Document ${i}`,
          content: 'Content',
          filePath: `/path/${i}`,
          mimeType: 'pdf',
          fileSize: 1000,
          userId: user.id,
          tenantId: user.tenantId,
        })),
      });

      const startTime = Date.now();

      const userWithDocuments = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          documents: {
            take: 20,
          },
        },
      });

      const duration = Date.now() - startTime;

      expect(userWithDocuments?.documents.length).toBe(20);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Concurrent User Simulation', () => {
    it('should handle multiple users performing different operations', async () => {
      const userCount = 20;
      const users = UserFactory.createMany(userCount);
      const tokens = users.map(user =>
        generateTestToken(jwtService, {
          sub: user.id,
          email: user.email,
          tenantId: user.tenantId,
        })
      );

      const operations = tokens.flatMap(token => [
        request(app.getHttpServer())
          .get('/documents')
          .set('Authorization', `Bearer ${token}`),
        request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${token}`),
        request(app.getHttpServer())
          .get('/health'),
      ]);

      const startTime = Date.now();
      const responses = await Promise.all(operations);
      const duration = Date.now() - startTime;

      const successCount = responses.filter(r => r.status < 400).length;
      const successRate = (successCount / responses.length) * 100;

      console.log(`Concurrent Users Test:`);
      console.log(`Total Operations: ${responses.length}`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Duration: ${duration}ms`);

      expect(successRate).toBeGreaterThan(95);
      expect(duration).toBeLessThan(10000);
    }, 15000);
  });

  describe('Memory Usage', () => {
    it('should not leak memory under sustained load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform 500 requests
      for (let i = 0; i < 500; i++) {
        await request(app.getHttpServer()).get('/health');
        
        if (i % 100 === 0) {
          global.gc && global.gc(); // Force garbage collection if available
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      console.log(`Memory Increase: ${memoryIncreaseMB.toFixed(2)}MB`);

      // Memory increase should be reasonable (< 50MB for 500 requests)
      expect(memoryIncreaseMB).toBeLessThan(50);
    }, 30000);
  });

  describe('Response Time Distribution', () => {
    it('should maintain consistent response times', async () => {
      const requests = 200;
      const responseTimes: number[] = [];

      for (let i = 0; i < requests; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer()).get('/health');
        responseTimes.push(Date.now() - startTime);
      }

      const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const sorted = responseTimes.sort((a, b) => a - b);
      const p50 = sorted[Math.floor(requests * 0.50)];
      const p95 = sorted[Math.floor(requests * 0.95)];
      const p99 = sorted[Math.floor(requests * 0.99)];
      const max = sorted[requests - 1];

      console.log(`Response Time Distribution:`);
      console.log(`Average: ${avg.toFixed(2)}ms`);
      console.log(`P50: ${p50}ms`);
      console.log(`P95: ${p95}ms`);
      console.log(`P99: ${p99}ms`);
      console.log(`Max: ${max}ms`);

      expect(avg).toBeLessThan(100);
      expect(p95).toBeLessThan(200);
      expect(p99).toBeLessThan(500);
    }, 30000);
  });

  describe('Cache Performance', () => {
    it('should improve response times with caching', async () => {
      const endpoint = '/api/cached-data';

      // First request (cache miss)
      const startTime1 = Date.now();
      await request(app.getHttpServer()).get(endpoint);
      const uncachedTime = Date.now() - startTime1;

      // Subsequent requests (cache hit)
      const cachedTimes: number[] = [];
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer()).get(endpoint);
        cachedTimes.push(Date.now() - startTime);
      }

      const avgCachedTime = cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length;

      console.log(`Uncached Time: ${uncachedTime}ms`);
      console.log(`Avg Cached Time: ${avgCachedTime.toFixed(2)}ms`);

      // Cached requests should be significantly faster
      expect(avgCachedTime).toBeLessThan(uncachedTime * 0.5);
    });
  });
});

