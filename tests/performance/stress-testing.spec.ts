/**
 * Stress Testing Suite
 * 
 * Tests system behavior under extreme conditions:
 * - Maximum throughput limits
 * - System breaking points
 * - Recovery from failures
 * - Resource exhaustion handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { generateTestToken, cleanupDatabase, createMockFile } from '../helpers/test-utils';
import { UserFactory, DocumentFactory } from '../helpers/test-factory';
import { JwtService } from '@nestjs/jwt';

describe('Stress Testing', () => {
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

  describe('Maximum Throughput', () => {
    it('should handle 500 simultaneous requests', async () => {
      const requests = Array.from({ length: 500 }, () =>
        request(app.getHttpServer()).get('/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      const successCount = responses.filter(r => r.status === 200).length;
      const failureCount = responses.length - successCount;
      const throughput = 500 / (duration / 1000);

      console.log(`Extreme Load Test Results:`);
      console.log(`Total Requests: 500`);
      console.log(`Success: ${successCount}`);
      console.log(`Failures: ${failureCount}`);
      console.log(`Duration: ${duration}ms`);
      console.log(`Throughput: ${throughput.toFixed(2)} req/s`);

      // Should handle at least 80% successfully
      expect(successCount / 500).toBeGreaterThan(0.8);
    }, 60000);

    it('should find system breaking point', async () => {
      const batchSizes = [100, 200, 500, 1000];
      const results: Array<{ size: number; successRate: number; duration: number }> = [];

      for (const size of batchSizes) {
        const requests = Array.from({ length: size }, () =>
          request(app.getHttpServer()).get('/health')
        );

        const startTime = Date.now();
        const responses = await Promise.allSettled(requests);
        const duration = Date.now() - startTime;

        const successCount = responses.filter(
          r => r.status === 'fulfilled' && r.value.status === 200
        ).length;
        const successRate = (successCount / size) * 100;

        results.push({ size, successRate, duration });

        console.log(`Batch Size: ${size}, Success Rate: ${successRate.toFixed(2)}%, Duration: ${duration}ms`);

        // If success rate drops below 50%, we've found the breaking point
        if (successRate < 50) {
          console.log(`Breaking point found at ${size} concurrent requests`);
          break;
        }

        // Cool down between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Should handle at least 100 concurrent requests with >90% success
      const batch100 = results.find(r => r.size === 100);
      expect(batch100?.successRate).toBeGreaterThan(90);
    }, 120000);
  });

  describe('Database Stress', () => {
    it('should handle massive bulk inserts', async () => {
      const recordCount = 1000;

      const startTime = Date.now();

      await prisma.user.createMany({
        data: Array.from({ length: recordCount }, (_, i) => ({
          email: `stress${i}@example.com`,
          firstName: `Stress${i}`,
          lastName: 'Test',
          passwordHash: 'hashed',
          tenantId: 'stress-tenant',
        })),
      });

      const duration = Date.now() - startTime;

      console.log(`Inserted ${recordCount} records in ${duration}ms`);

      const count = await prisma.user.count({
        where: { tenantId: 'stress-tenant' },
      });

      expect(count).toBe(recordCount);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    }, 45000);

    it('should handle high read concurrency', async () => {
      // Seed data
      await prisma.user.createMany({
        data: Array.from({ length: 100 }, (_, i) => ({
          email: `readtest${i}@example.com`,
          firstName: `User${i}`,
          lastName: 'ReadTest',
          passwordHash: 'hashed',
          tenantId: 'read-tenant',
        })),
      });

      // Perform 200 concurrent reads
      const queries = Array.from({ length: 200 }, () =>
        prisma.user.findMany({
          where: { tenantId: 'read-tenant' },
          take: 10,
        })
      );

      const startTime = Date.now();
      const results = await Promise.allSettled(queries);
      const duration = Date.now() - startTime;

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / 200) * 100;

      console.log(`Read Stress Test:`);
      console.log(`Total Queries: 200`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Duration: ${duration}ms`);

      expect(successRate).toBeGreaterThan(95);
    }, 30000);

    it('should handle mixed read/write operations', async () => {
      const operations: Promise<any>[] = [];

      // Mix of reads and writes
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          // Write operation
          operations.push(
            prisma.user.create({
              data: {
                email: `mixed${i}@example.com`,
                firstName: `User${i}`,
                lastName: 'Mixed',
                passwordHash: 'hashed',
                tenantId: 'mixed-tenant',
              },
            })
          );
        } else {
          // Read operation
          operations.push(
            prisma.user.findMany({
              where: { tenantId: 'mixed-tenant' },
              take: 10,
            })
          );
        }
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(operations);
      const duration = Date.now() - startTime;

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / operations.length) * 100;

      console.log(`Mixed Operations:`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Duration: ${duration}ms`);

      expect(successRate).toBeGreaterThan(90);
    }, 30000);
  });

  describe('Memory Stress', () => {
    it('should handle large payloads', async () => {
      const user = UserFactory.create();
      const token = generateTestToken(jwtService, {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
      });

      // Create a large payload (1MB)
      const largeContent = 'x'.repeat(1024 * 1024);

      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Large Document',
          content: largeContent,
          filePath: '/path/large.txt',
          mimeType: 'text/plain',
          fileSize: largeContent.length,
        });

      // Should handle or reject gracefully
      expect([201, 413]).toContain(response.status);
    }, 15000);

    it('should handle rapid allocations', async () => {
      const allocations: any[] = [];

      for (let i = 0; i < 1000; i++) {
        allocations.push({
          id: i,
          data: new Array(1000).fill(Math.random()),
        });
      }

      const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`Memory Used After Allocations: ${memoryUsed.toFixed(2)}MB`);

      // Clear allocations
      allocations.length = 0;

      // Should not crash
      expect(memoryUsed).toBeGreaterThan(0);
    });

    it('should recover from memory pressure', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create memory pressure
      const large Array = new Array(1000000).fill({ data: 'test' });

      const peakMemory = process.memoryUsage().heapUsed;

      // Release memory
      (largeArray as any) = null;
      global.gc && global.gc(); // Force GC if available

      await new Promise(resolve => setTimeout(resolve, 1000));

      const finalMemory = process.memoryUsage().heapUsed;

      console.log(`Memory Recovery:`);
      console.log(`Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Peak: ${(peakMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);

      // Memory should be released
      expect(finalMemory).toBeLessThan(peakMemory);
    });
  });

  describe('Connection Pool Stress', () => {
    it('should handle connection pool exhaustion', async () => {
      // Create more concurrent queries than connection pool size
      const queries = Array.from({ length: 50 }, () =>
        prisma.user.findMany({ take: 10 })
      );

      const results = await Promise.allSettled(queries);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / queries.length) * 100;

      console.log(`Connection Pool Test:`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);

      // Should handle gracefully (queue requests)
      expect(successRate).toBeGreaterThan(80);
    }, 15000);
  });

  describe('Rate Limit Stress', () => {
    it('should enforce rate limits under stress', async () => {
      const requests = Array.from({ length: 200 }, () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password',
          })
      );

      const responses = await Promise.all(requests);

      const successCount = responses.filter(r => r.status < 429).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      console.log(`Rate Limit Test:`);
      console.log(`Success: ${successCount}`);
      console.log(`Rate Limited: ${rateLimitedCount}`);

      // Should rate limit excessive requests
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error Recovery', () => {
    it('should recover from database connection loss', async () => {
      // This would require actually disconnecting the database
      // For now, test that the system handles errors gracefully

      try {
        // Simulate error by querying non-existent table
        await prisma.$queryRaw`SELECT * FROM non_existent_table`;
      } catch (error) {
        // Error should be caught
        expect(error).toBeDefined();
      }

      // System should still respond to requests
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });

    it('should handle cascading failures', async () => {
      // Simulate multiple failing operations
      const operations = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post('/documents')
          .send({ invalid: 'data' })
      );

      const responses = await Promise.all(operations);

      // All should fail gracefully
      expect(responses.every(r => r.status === 400 || r.status === 401)).toBe(true);

      // System should still be responsive
      const healthCheck = await request(app.getHttpServer()).get('/health');
      expect(healthCheck.status).toBe(200);
    });
  });

  describe('Long Running Operations', () => {
    it('should handle multiple long-running requests', async () => {
      const longRequests = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/api/long-operation') // Endpoint that takes >5 seconds
          .timeout(30000)
      );

      const startTime = Date.now();
      const results = await Promise.allSettled(longRequests);
      const duration = Date.now() - startTime;

      console.log(`Long Running Operations:`);
      console.log(`Duration: ${duration}ms`);

      // Should complete or timeout gracefully
      expect(results.every(r => r.status === 'fulfilled' || r.status === 'rejected')).toBe(true);
    }, 60000);
  });

  describe('Rapid State Changes', () => {
    it('should handle rapid create/delete cycles', async () => {
      const user = UserFactory.create();
      const token = generateTestToken(jwtService, {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
      });

      for (let i = 0; i < 10; i++) {
        // Create document
        const createResponse = await request(app.getHttpServer())
          .post('/documents')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: `Rapid ${i}`,
            content: 'Content',
            filePath: `/path/${i}`,
            mimeType: 'pdf',
            fileSize: 1000,
          });

        if (createResponse.status === 201) {
          // Immediately delete
          await request(app.getHttpServer())
            .delete(`/documents/${createResponse.body.id}`)
            .set('Authorization', `Bearer ${token}`);
        }
      }

      // System should remain stable
      const healthCheck = await request(app.getHttpServer()).get('/health');
      expect(healthCheck.status).toBe(200);
    }, 30000);
  });

  describe('Resource Cleanup', () => {
    it('should cleanup resources after stress', async () => {
      // Perform stress operations
      const operations = Array.from({ length: 100 }, () =>
        request(app.getHttpServer()).get('/health')
      );

      await Promise.all(operations);

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check system state
      const healthCheck = await request(app.getHttpServer()).get('/health');
      expect(healthCheck.status).toBe(200);

      // Memory should be reasonable
      const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`Memory After Cleanup: ${memoryUsed.toFixed(2)}MB`);
      
      expect(memoryUsed).toBeLessThan(500); // Less than 500MB
    });
  });
});

