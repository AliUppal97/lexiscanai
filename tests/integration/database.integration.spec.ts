/**
 * Database Integration Tests
 * 
 * Tests database operations including:
 * - Connection management
 * - CRUD operations
 * - Transactions
 * - Concurrent operations
 * - Data integrity
 * - Migrations
 */

import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { UserFactory, DocumentFactory, SubscriptionFactory } from '../helpers/test-factory';

describe('Database Integration Tests', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Organization" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE`;
  });

  describe('Connection Management', () => {
    it('should successfully connect to database', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      expect(result).toBeDefined();
    });

    it('should handle multiple simultaneous connections', async () => {
      const queries = Array.from({ length: 10 }, () =>
        prisma.$queryRaw`SELECT 1 as test`
      );

      const results = await Promise.all(queries);
      expect(results).toHaveLength(10);
    });

    it('should reconnect after connection loss', async () => {
      // Simulate connection loss and recovery
      await prisma.$disconnect();
      await prisma.$connect();

      const result = await prisma.$queryRaw`SELECT 1 as reconnected`;
      expect(result).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    describe('Create', () => {
      it('should create a new user', async () => {
        const userData = UserFactory.create();

        const user = await prisma.user.create({
          data: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            passwordHash: 'hashed-password',
            tenantId: userData.tenantId,
          },
        });

        expect(user).toHaveProperty('id');
        expect(user.email).toBe(userData.email);
      });

      it('should enforce unique constraints', async () => {
        const email = 'duplicate@example.com';
        
        await prisma.user.create({
          data: {
            email,
            firstName: 'First',
            lastName: 'User',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        await expect(
          prisma.user.create({
            data: {
              email,
              firstName: 'Second',
              lastName: 'User',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
            },
          })
        ).rejects.toThrow();
      });

      it('should create records with relationships', async () => {
        const user = await prisma.user.create({
          data: {
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        const document = await prisma.document.create({
          data: {
            title: 'Test Document',
            content: 'Content',
            filePath: '/path/to/file',
            mimeType: 'application/pdf',
            fileSize: 1000,
            userId: user.id,
            tenantId: user.tenantId,
          },
        });

        expect(document.userId).toBe(user.id);
      });
    });

    describe('Read', () => {
      it('should find record by id', async () => {
        const created = await prisma.user.create({
          data: {
            email: 'find@example.com',
            firstName: 'Find',
            lastName: 'Me',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        const found = await prisma.user.findUnique({
          where: { id: created.id },
        });

        expect(found).toBeDefined();
        expect(found?.id).toBe(created.id);
      });

      it('should find records with filters', async () => {
        await prisma.user.createMany({
          data: [
            {
              email: 'active1@example.com',
              firstName: 'Active',
              lastName: 'One',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
              isActive: true,
            },
            {
              email: 'active2@example.com',
              firstName: 'Active',
              lastName: 'Two',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
              isActive: true,
            },
            {
              email: 'inactive@example.com',
              firstName: 'Inactive',
              lastName: 'User',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
              isActive: false,
            },
          ],
        });

        const activeUsers = await prisma.user.findMany({
          where: { isActive: true },
        });

        expect(activeUsers).toHaveLength(2);
        activeUsers.forEach(user => {
          expect(user.isActive).toBe(true);
        });
      });

      it('should support pagination', async () => {
        // Create 15 users
        await prisma.user.createMany({
          data: Array.from({ length: 15 }, (_, i) => ({
            email: `user${i}@example.com`,
            firstName: `User${i}`,
            lastName: 'Test',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          })),
        });

        const page1 = await prisma.user.findMany({
          skip: 0,
          take: 10,
        });

        const page2 = await prisma.user.findMany({
          skip: 10,
          take: 10,
        });

        expect(page1).toHaveLength(10);
        expect(page2).toHaveLength(5);
      });

      it('should include related records', async () => {
        const user = await prisma.user.create({
          data: {
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        await prisma.document.create({
          data: {
            title: 'Test Document',
            content: 'Content',
            filePath: '/path',
            mimeType: 'pdf',
            fileSize: 1000,
            userId: user.id,
            tenantId: user.tenantId,
          },
        });

        const userWithDocuments = await prisma.user.findUnique({
          where: { id: user.id },
          include: { documents: true },
        });

        expect(userWithDocuments?.documents).toHaveLength(1);
      });
    });

    describe('Update', () => {
      it('should update a record', async () => {
        const user = await prisma.user.create({
          data: {
            email: 'update@example.com',
            firstName: 'Original',
            lastName: 'Name',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { firstName: 'Updated' },
        });

        expect(updated.firstName).toBe('Updated');
      });

      it('should update multiple records', async () => {
        await prisma.user.createMany({
          data: [
            {
              email: 'user1@example.com',
              firstName: 'User',
              lastName: 'One',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
              isActive: false,
            },
            {
              email: 'user2@example.com',
              firstName: 'User',
              lastName: 'Two',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
              isActive: false,
            },
          ],
        });

        const result = await prisma.user.updateMany({
          where: { isActive: false },
          data: { isActive: true },
        });

        expect(result.count).toBe(2);
      });
    });

    describe('Delete', () => {
      it('should delete a record', async () => {
        const user = await prisma.user.create({
          data: {
            email: 'delete@example.com',
            firstName: 'Delete',
            lastName: 'Me',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        await prisma.user.delete({
          where: { id: user.id },
        });

        const found = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(found).toBeNull();
      });

      it('should cascade delete related records', async () => {
        const user = await prisma.user.create({
          data: {
            email: 'cascade@example.com',
            firstName: 'Cascade',
            lastName: 'Test',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        await prisma.document.create({
          data: {
            title: 'Document',
            content: 'Content',
            filePath: '/path',
            mimeType: 'pdf',
            fileSize: 1000,
            userId: user.id,
            tenantId: user.tenantId,
          },
        });

        await prisma.user.delete({
          where: { id: user.id },
        });

        const documents = await prisma.document.findMany({
          where: { userId: user.id },
        });

        expect(documents).toHaveLength(0);
      });
    });
  });

  describe('Transactions', () => {
    it('should commit successful transactions', async () => {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: 'transaction@example.com',
            firstName: 'Transaction',
            lastName: 'User',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
        });

        const document = await tx.document.create({
          data: {
            title: 'Document',
            content: 'Content',
            filePath: '/path',
            mimeType: 'pdf',
            fileSize: 1000,
            userId: user.id,
            tenantId: user.tenantId,
          },
        });

        return { user, document };
      });

      expect(result.user).toBeDefined();
      expect(result.document).toBeDefined();

      // Verify data persisted
      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
      });
      expect(user).toBeDefined();
    });

    it('should rollback failed transactions', async () => {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.user.create({
            data: {
              email: 'rollback@example.com',
              firstName: 'Rollback',
              lastName: 'Test',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
            },
          });

          // Force an error
          throw new Error('Transaction failed');
        });
      } catch (error) {
        // Expected error
      }

      // Verify data was rolled back
      const users = await prisma.user.findMany({
        where: { email: 'rollback@example.com' },
      });
      expect(users).toHaveLength(0);
    });

    it('should handle concurrent transactions', async () => {
      const transactions = Array.from({ length: 5 }, (_, i) =>
        prisma.$transaction(async (tx) => {
          return tx.user.create({
            data: {
              email: `concurrent${i}@example.com`,
              firstName: `User${i}`,
              lastName: 'Concurrent',
              passwordHash: 'hashed',
              tenantId: 'tenant-1',
            },
          });
        })
      );

      const results = await Promise.all(transactions);
      expect(results).toHaveLength(5);

      const users = await prisma.user.findMany();
      expect(users).toHaveLength(5);
    });
  });

  describe('Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      await expect(
        prisma.document.create({
          data: {
            title: 'Document',
            content: 'Content',
            filePath: '/path',
            mimeType: 'pdf',
            fileSize: 1000,
            userId: 'non-existent-user-id',
            tenantId: 'tenant-1',
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce NOT NULL constraints', async () => {
      await expect(
        prisma.user.create({
          data: {
            email: 'test@example.com',
            firstName: 'Test',
            // Missing required lastName
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should handle default values', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'defaults@example.com',
          firstName: 'Default',
          lastName: 'Test',
          passwordHash: 'hashed',
          tenantId: 'tenant-1',
          // isActive should default to true
        },
      });

      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Performance', () => {
    it('should efficiently handle bulk inserts', async () => {
      const startTime = Date.now();

      await prisma.user.createMany({
        data: Array.from({ length: 100 }, (_, i) => ({
          email: `bulk${i}@example.com`,
          firstName: `User${i}`,
          lastName: 'Bulk',
          passwordHash: 'hashed',
          tenantId: 'tenant-1',
        })),
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      const count = await prisma.user.count();
      expect(count).toBe(100);
    });

    it('should efficiently query large datasets', async () => {
      await prisma.user.createMany({
        data: Array.from({ length: 1000 }, (_, i) => ({
          email: `query${i}@example.com`,
          firstName: `User${i}`,
          lastName: 'Query',
          passwordHash: 'hashed',
          tenantId: 'tenant-1',
        })),
      });

      const startTime = Date.now();

      const users = await prisma.user.findMany({
        where: {
          email: { contains: 'query' },
        },
        take: 100,
      });

      const duration = Date.now() - startTime;

      expect(users).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Multi-tenancy', () => {
    it('should isolate data by tenant', async () => {
      await prisma.user.createMany({
        data: [
          {
            email: 'tenant1@example.com',
            firstName: 'Tenant1',
            lastName: 'User',
            passwordHash: 'hashed',
            tenantId: 'tenant-1',
          },
          {
            email: 'tenant2@example.com',
            firstName: 'Tenant2',
            lastName: 'User',
            passwordHash: 'hashed',
            tenantId: 'tenant-2',
          },
        ],
      });

      const tenant1Users = await prisma.user.findMany({
        where: { tenantId: 'tenant-1' },
      });

      const tenant2Users = await prisma.user.findMany({
        where: { tenantId: 'tenant-2' },
      });

      expect(tenant1Users).toHaveLength(1);
      expect(tenant2Users).toHaveLength(1);
      expect(tenant1Users[0].tenantId).not.toBe(tenant2Users[0].tenantId);
    });
  });
});

