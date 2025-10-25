/**
 * Documents E2E Tests
 * 
 * Tests complete document management flows including:
 * - Document upload
 * - Document processing
 * - Document retrieval
 * - Document updates
 * - Document deletion
 * - Multi-tenant isolation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { UserFactory, DocumentFactory } from '../helpers/test-factory';
import { cleanupDatabase, generateTestToken, authenticatedRequest, createMockFile } from '../helpers/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('Documents E2E Tests', () => {
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
    
    // Create user in database and generate token
    authToken = generateTestToken(jwtService, {
      sub: testUser.id,
      email: testUser.email,
      tenantId: testUser.tenantId,
    });
  });

  describe('POST /documents/upload', () => {
    it('should upload a document successfully', async () => {
      const mockFile = createMockFile('test-document.pdf', 5000);

      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', mockFile.buffer, mockFile.originalname)
        .field('title', 'Test Document')
        .field('description', 'Test Description')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Document');
      expect(response.body.status).toBeDefined();
    });

    it('should fail upload without authentication', async () => {
      const mockFile = createMockFile('test-document.pdf');

      await request(app.getHttpServer())
        .post('/documents/upload')
        .attach('file', mockFile.buffer, mockFile.originalname)
        .expect(401);
    });

    it('should fail upload with file size exceeding limit', async () => {
      const largeFile = createMockFile('large-document.pdf', 200 * 1024 * 1024); // 200MB

      await request(app.getHttpServer())
        .post('/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFile.buffer, largeFile.originalname)
        .expect(413);
    });

    it('should fail upload with unsupported file type', async () => {
      const mockFile = createMockFile('test-document.exe');

      await request(app.getHttpServer())
        .post('/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', mockFile.buffer, mockFile.originalname)
        .expect(400);
    });
  });

  describe('POST /documents', () => {
    it('should create a document record', async () => {
      const createDto = {
        title: 'Test Document',
        content: 'This is test content',
        filePath: '/documents/test.pdf',
        mimeType: 'application/pdf',
        fileSize: 5000,
      };

      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createDto.title);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.tenantId).toBe(testUser.tenantId);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        content: 'Content without title',
      };

      await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = DocumentFactory.create({
        userId: testUser.id,
        tenantId: testUser.tenantId,
      });

      // Create document in database
      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: doc.title,
          content: doc.content,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        });

      documentId = response.body.id;
    });

    it('should retrieve a document by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(documentId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
    });

    it('should fail to retrieve non-existent document', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/documents/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/documents/${documentId}`)
        .expect(401);
    });
  });

  describe('GET /documents', () => {
    beforeEach(async () => {
      // Create multiple documents
      const docs = DocumentFactory.createMany(5, {
        userId: testUser.id,
        tenantId: testUser.tenantId,
      });

      for (const doc of docs) {
        await request(app.getHttpServer())
          .post('/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: doc.title,
            content: doc.content,
            filePath: doc.filePath,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
          });
      }
    });

    it('should list all documents for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.page).toBe(1);
    });

    it('should support filtering by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?status=COMPLETED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((doc: any) => {
        expect(doc.status).toBe('COMPLETED');
      });
    });

    it('should support search functionality', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PATCH /documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = DocumentFactory.create({
        userId: testUser.id,
        tenantId: testUser.tenantId,
      });

      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: doc.title,
          content: doc.content,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        });

      documentId = response.body.id;
    });

    it('should update a document', async () => {
      const updateDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const response = await request(app.getHttpServer())
        .patch(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
      expect(response.body.content).toBe(updateDto.content);
    });

    it('should fail to update non-existent document', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .patch(`/documents/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = DocumentFactory.create({
        userId: testUser.id,
        tenantId: testUser.tenantId,
      });

      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: doc.title,
          content: doc.content,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        });

      documentId = response.body.id;
    });

    it('should delete a document', async () => {
      await request(app.getHttpServer())
        .delete(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent document', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/documents/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Multi-tenant Isolation', () => {
    let tenant1User: any;
    let tenant2User: any;
    let tenant1Token: string;
    let tenant2Token: string;
    let tenant1DocumentId: string;

    beforeEach(async () => {
      tenant1User = UserFactory.create({ tenantId: 'tenant-1' });
      tenant2User = UserFactory.create({ tenantId: 'tenant-2' });

      tenant1Token = generateTestToken(jwtService, {
        sub: tenant1User.id,
        email: tenant1User.email,
        tenantId: tenant1User.tenantId,
      });

      tenant2Token = generateTestToken(jwtService, {
        sub: tenant2User.id,
        email: tenant2User.email,
        tenantId: tenant2User.tenantId,
      });

      // Create document in tenant 1
      const response = await request(app.getHttpServer())
        .post('/documents')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          title: 'Tenant 1 Document',
          content: 'Content for tenant 1',
          filePath: '/documents/tenant1.pdf',
          mimeType: 'application/pdf',
          fileSize: 5000,
        });

      tenant1DocumentId = response.body.id;
    });

    it('should prevent access to documents from other tenants', async () => {
      await request(app.getHttpServer())
        .get(`/documents/${tenant1DocumentId}`)
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(404); // Should not find document from another tenant
    });

    it('should only list documents from own tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      // Tenant 2 should have no documents
      expect(response.body.data.length).toBe(0);
    });
  });
});

