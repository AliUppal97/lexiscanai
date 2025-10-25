/**
 * Billing E2E Tests
 * 
 * Tests complete billing and subscription flows including:
 * - Subscription creation
 * - Subscription updates
 * - Subscription cancellation
 * - Invoice generation
 * - Stripe webhook handling
 * - Payment processing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import { PrismaService } from '../../apps/api/src/common/prisma.service';
import { UserFactory, SubscriptionFactory } from '../helpers/test-factory';
import { cleanupDatabase, generateTestToken } from '../helpers/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('Billing E2E Tests', () => {
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

  describe('POST /billing/subscriptions', () => {
    it('should create a new subscription', async () => {
      const createDto = {
        plan: 'PROFESSIONAL',
        paymentMethodId: 'pm_test_123',
      };

      const response = await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.plan).toBe(createDto.plan);
      expect(response.body.status).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const createDto = {
        plan: 'PROFESSIONAL',
        paymentMethodId: 'pm_test_123',
      };

      await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .send(createDto)
        .expect(401);
    });

    it('should validate plan type', async () => {
      const invalidDto = {
        plan: 'INVALID_PLAN',
        paymentMethodId: 'pm_test_123',
      };

      await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should require payment method', async () => {
      const invalidDto = {
        plan: 'PROFESSIONAL',
      };

      await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /billing/subscriptions/current', () => {
    beforeEach(async () => {
      // Create a subscription
      await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'PROFESSIONAL',
          paymentMethodId: 'pm_test_123',
        });
    });

    it('should retrieve current subscription', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/subscriptions/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('plan');
      expect(response.body).toHaveProperty('status');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/billing/subscriptions/current')
        .expect(401);
    });
  });

  describe('PATCH /billing/subscriptions/:id', () => {
    let subscriptionId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'STARTER',
          paymentMethodId: 'pm_test_123',
        });

      subscriptionId = response.body.id;
    });

    it('should upgrade subscription plan', async () => {
      const updateDto = {
        plan: 'PROFESSIONAL',
      };

      const response = await request(app.getHttpServer())
        .patch(`/billing/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.plan).toBe(updateDto.plan);
    });

    it('should downgrade subscription plan', async () => {
      const updateDto = {
        plan: 'FREE',
      };

      const response = await request(app.getHttpServer())
        .patch(`/billing/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.plan).toBe(updateDto.plan);
    });
  });

  describe('DELETE /billing/subscriptions/:id', () => {
    let subscriptionId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'PROFESSIONAL',
          paymentMethodId: 'pm_test_123',
        });

      subscriptionId = response.body.id;
    });

    it('should cancel subscription', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/billing/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELED');
    });

    it('should fail to cancel non-existent subscription', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/billing/subscriptions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /billing/invoices', () => {
    beforeEach(async () => {
      // Create subscription which will generate invoices
      await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'PROFESSIONAL',
          paymentMethodId: 'pm_test_123',
        });
    });

    it('should list all invoices for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/invoices?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body.page).toBe(1);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/invoices?status=PAID')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /billing/stripe-webhook', () => {
    it('should handle payment success webhook', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2999,
            currency: 'usd',
            status: 'succeeded',
          },
        },
      };

      const signature = 'test-signature'; // Mock signature

      await request(app.getHttpServer())
        .post('/billing/stripe-webhook')
        .set('stripe-signature', signature)
        .send(webhookPayload)
        .expect(200);
    });

    it('should handle subscription created webhook', async () => {
      const webhookPayload = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            items: {
              data: [{
                price: {
                  id: 'price_professional',
                },
              }],
            },
          },
        },
      };

      const signature = 'test-signature';

      await request(app.getHttpServer())
        .post('/billing/stripe-webhook')
        .set('stripe-signature', signature)
        .send(webhookPayload)
        .expect(200);
    });

    it('should handle subscription canceled webhook', async () => {
      const webhookPayload = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled',
          },
        },
      };

      const signature = 'test-signature';

      await request(app.getHttpServer())
        .post('/billing/stripe-webhook')
        .set('stripe-signature', signature)
        .send(webhookPayload)
        .expect(200);
    });

    it('should fail webhook with invalid signature', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {},
      };

      await request(app.getHttpServer())
        .post('/billing/stripe-webhook')
        .set('stripe-signature', 'invalid-signature')
        .send(webhookPayload)
        .expect(400);
    });

    it('should fail webhook without signature', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {},
      };

      await request(app.getHttpServer())
        .post('/billing/stripe-webhook')
        .send(webhookPayload)
        .expect(400);
    });
  });

  describe('Subscription Lifecycle', () => {
    it('should handle complete subscription lifecycle', async () => {
      // 1. Create subscription
      const createResponse = await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'STARTER',
          paymentMethodId: 'pm_test_123',
        })
        .expect(201);

      const subscriptionId = createResponse.body.id;
      expect(createResponse.body.status).toBe('ACTIVE');

      // 2. Upgrade plan
      const upgradeResponse = await request(app.getHttpServer())
        .patch(`/billing/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ plan: 'PROFESSIONAL' })
        .expect(200);

      expect(upgradeResponse.body.plan).toBe('PROFESSIONAL');

      // 3. Check invoices were generated
      const invoicesResponse = await request(app.getHttpServer())
        .get('/billing/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(invoicesResponse.body.data.length).toBeGreaterThan(0);

      // 4. Cancel subscription
      const cancelResponse = await request(app.getHttpServer())
        .delete(`/billing/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(cancelResponse.body.status).toBe('CANCELED');
    });
  });

  describe('Multi-tenant Billing Isolation', () => {
    let tenant1User: any;
    let tenant2User: any;
    let tenant1Token: string;
    let tenant2Token: string;
    let tenant1SubscriptionId: string;

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

      // Create subscription for tenant 1
      const response = await request(app.getHttpServer())
        .post('/billing/subscriptions')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          plan: 'PROFESSIONAL',
          paymentMethodId: 'pm_test_123',
        });

      tenant1SubscriptionId = response.body.id;
    });

    it('should prevent access to subscriptions from other tenants', async () => {
      await request(app.getHttpServer())
        .patch(`/billing/subscriptions/${tenant1SubscriptionId}`)
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({ plan: 'ENTERPRISE' })
        .expect(404);
    });

    it('should isolate invoice listings by tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/invoices')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      // Tenant 2 should have no invoices
      expect(response.body.data.length).toBe(0);
    });
  });
});

