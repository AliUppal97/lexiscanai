/**
 * Stripe Integration Tests
 * 
 * Tests Stripe payment integration including:
 * - Customer creation
 * - Subscription management
 * - Payment intents
 * - Webhook handling
 * - Refunds
 */

import { StripeService } from '../../apps/api/src/modules/billing/stripe.service';
import { UserFactory } from '../helpers/test-factory';

describe('Stripe Integration Tests', () => {
  let stripeService: StripeService;

  beforeAll(async () => {
    stripeService = new StripeService();
  });

  describe('Customer Management', () => {
    it('should create a new Stripe customer', async () => {
      const user = UserFactory.create();

      const customer = await stripeService.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
          tenantId: user.tenantId,
        },
      });

      expect(customer).toHaveProperty('id');
      expect(customer.id).toMatch(/^cus_/);
      expect(customer.email).toBe(user.email);
    });

    it('should retrieve an existing customer', async () => {
      const user = UserFactory.create();

      const created = await stripeService.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      const retrieved = await stripeService.getCustomer(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.email).toBe(user.email);
    });

    it('should update customer information', async () => {
      const customer = await stripeService.createCustomer({
        email: 'original@example.com',
        name: 'Original Name',
      });

      const updated = await stripeService.updateCustomer(customer.id, {
        name: 'Updated Name',
        email: 'updated@example.com',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe('updated@example.com');
    });

    it('should delete a customer', async () => {
      const customer = await stripeService.createCustomer({
        email: 'delete@example.com',
        name: 'Delete Me',
      });

      const deleted = await stripeService.deleteCustomer(customer.id);

      expect(deleted.deleted).toBe(true);
    });

    it('should attach metadata to customer', async () => {
      const customer = await stripeService.createCustomer({
        email: 'metadata@example.com',
        name: 'Metadata Test',
        metadata: {
          userId: 'user-123',
          tenantId: 'tenant-456',
          plan: 'professional',
        },
      });

      expect(customer.metadata.userId).toBe('user-123');
      expect(customer.metadata.tenantId).toBe('tenant-456');
    });
  });

  describe('Payment Methods', () => {
    let customerId: string;

    beforeEach(async () => {
      const customer = await stripeService.createCustomer({
        email: 'payment@example.com',
        name: 'Payment Test',
      });
      customerId = customer.id;
    });

    it('should create a payment method', async () => {
      const paymentMethod = await stripeService.createPaymentMethod({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      expect(paymentMethod).toHaveProperty('id');
      expect(paymentMethod.id).toMatch(/^pm_/);
    });

    it('should attach payment method to customer', async () => {
      const paymentMethod = await stripeService.createPaymentMethod({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      const attached = await stripeService.attachPaymentMethod(
        paymentMethod.id,
        customerId
      );

      expect(attached.customer).toBe(customerId);
    });

    it('should list customer payment methods', async () => {
      const methods = await stripeService.listPaymentMethods(customerId);

      expect(Array.isArray(methods)).toBe(true);
    });
  });

  describe('Subscription Management', () => {
    let customerId: string;
    let paymentMethodId: string;

    beforeEach(async () => {
      // Create customer
      const customer = await stripeService.createCustomer({
        email: 'subscription@example.com',
        name: 'Subscription Test',
      });
      customerId = customer.id;

      // Create and attach payment method
      const paymentMethod = await stripeService.createPaymentMethod({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });
      paymentMethodId = paymentMethod.id;

      await stripeService.attachPaymentMethod(paymentMethodId, customerId);
      await stripeService.setDefaultPaymentMethod(customerId, paymentMethodId);
    });

    it('should create a subscription', async () => {
      const subscription = await stripeService.createSubscription({
        customerId,
        priceId: 'price_professional_monthly',
        metadata: {
          tenantId: 'tenant-123',
        },
      });

      expect(subscription).toHaveProperty('id');
      expect(subscription.id).toMatch(/^sub_/);
      expect(subscription.status).toBeDefined();
    });

    it('should retrieve a subscription', async () => {
      const created = await stripeService.createSubscription({
        customerId,
        priceId: 'price_starter_monthly',
      });

      const retrieved = await stripeService.getSubscription(created.id);

      expect(retrieved.id).toBe(created.id);
    });

    it('should update a subscription', async () => {
      const subscription = await stripeService.createSubscription({
        customerId,
        priceId: 'price_starter_monthly',
      });

      const updated = await stripeService.updateSubscription(subscription.id, {
        priceId: 'price_professional_monthly', // Upgrade
      });

      expect(updated.id).toBe(subscription.id);
      // Verify the price was updated
    });

    it('should cancel a subscription immediately', async () => {
      const subscription = await stripeService.createSubscription({
        customerId,
        priceId: 'price_starter_monthly',
      });

      const canceled = await stripeService.cancelSubscription(subscription.id, {
        immediate: true,
      });

      expect(canceled.status).toBe('canceled');
    });

    it('should cancel subscription at period end', async () => {
      const subscription = await stripeService.createSubscription({
        customerId,
        priceId: 'price_starter_monthly',
      });

      const canceled = await stripeService.cancelSubscription(subscription.id, {
        immediate: false,
      });

      expect(canceled.cancel_at_period_end).toBe(true);
      expect(canceled.status).toBe('active');
    });

    it('should list customer subscriptions', async () => {
      await stripeService.createSubscription({
        customerId,
        priceId: 'price_starter_monthly',
      });

      const subscriptions = await stripeService.listSubscriptions(customerId);

      expect(Array.isArray(subscriptions)).toBe(true);
      expect(subscriptions.length).toBeGreaterThan(0);
    });

    it('should apply coupon to subscription', async () => {
      // Create a coupon first
      const coupon = await stripeService.createCoupon({
        percent_off: 20,
        duration: 'once',
      });

      const subscription = await stripeService.createSubscription({
        customerId,
        priceId: 'price_professional_monthly',
        coupon: coupon.id,
      });

      expect(subscription.discount).toBeDefined();
    });
  });

  describe('Payment Intents', () => {
    let customerId: string;

    beforeEach(async () => {
      const customer = await stripeService.createCustomer({
        email: 'payment-intent@example.com',
        name: 'Payment Intent Test',
      });
      customerId = customer.id;
    });

    it('should create a payment intent', async () => {
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 2999, // $29.99
        currency: 'usd',
        customerId,
        metadata: {
          orderId: 'order-123',
        },
      });

      expect(paymentIntent).toHaveProperty('id');
      expect(paymentIntent.id).toMatch(/^pi_/);
      expect(paymentIntent.amount).toBe(2999);
      expect(paymentIntent.client_secret).toBeDefined();
    });

    it('should confirm a payment intent', async () => {
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 1999,
        currency: 'usd',
        customerId,
      });

      const confirmed = await stripeService.confirmPaymentIntent(
        paymentIntent.id,
        'pm_card_visa'
      );

      expect(confirmed.status).toBe('succeeded');
    });

    it('should cancel a payment intent', async () => {
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 4999,
        currency: 'usd',
        customerId,
      });

      const canceled = await stripeService.cancelPaymentIntent(paymentIntent.id);

      expect(canceled.status).toBe('canceled');
    });

    it('should handle payment intent failures', async () => {
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 100,
        currency: 'usd',
        customerId,
      });

      // Use a test card that will fail
      await expect(
        stripeService.confirmPaymentIntent(paymentIntent.id, 'pm_card_chargeDeclined')
      ).rejects.toThrow();
    });
  });

  describe('Invoices', () => {
    let customerId: string;

    beforeEach(async () => {
      const customer = await stripeService.createCustomer({
        email: 'invoice@example.com',
        name: 'Invoice Test',
      });
      customerId = customer.id;
    });

    it('should create an invoice', async () => {
      const invoice = await stripeService.createInvoice({
        customerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
      });

      expect(invoice).toHaveProperty('id');
      expect(invoice.id).toMatch(/^in_/);
    });

    it('should finalize an invoice', async () => {
      const invoice = await stripeService.createInvoice({
        customerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
      });

      const finalized = await stripeService.finalizeInvoice(invoice.id);

      expect(finalized.status).toBe('open');
    });

    it('should pay an invoice', async () => {
      const invoice = await stripeService.createInvoice({
        customerId,
        collection_method: 'charge_automatically',
      });

      const paid = await stripeService.payInvoice(invoice.id);

      expect(paid.status).toBe('paid');
    });

    it('should list customer invoices', async () => {
      const invoices = await stripeService.listInvoices(customerId);

      expect(Array.isArray(invoices)).toBe(true);
    });

    it('should void an invoice', async () => {
      const invoice = await stripeService.createInvoice({
        customerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
      });

      await stripeService.finalizeInvoice(invoice.id);
      const voided = await stripeService.voidInvoice(invoice.id);

      expect(voided.status).toBe('void');
    });
  });

  describe('Refunds', () => {
    it('should create a refund for a payment', async () => {
      // First, create a successful payment
      const customer = await stripeService.createCustomer({
        email: 'refund@example.com',
        name: 'Refund Test',
      });

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
        customerId: customer.id,
      });

      const confirmed = await stripeService.confirmPaymentIntent(
        paymentIntent.id,
        'pm_card_visa'
      );

      // Create refund
      const refund = await stripeService.createRefund({
        paymentIntentId: confirmed.id,
      });

      expect(refund).toHaveProperty('id');
      expect(refund.id).toMatch(/^re_/);
      expect(refund.status).toBeDefined();
    });

    it('should create partial refund', async () => {
      const customer = await stripeService.createCustomer({
        email: 'partial-refund@example.com',
        name: 'Partial Refund Test',
      });

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 10000, // $100
        currency: 'usd',
        customerId: customer.id,
      });

      await stripeService.confirmPaymentIntent(paymentIntent.id, 'pm_card_visa');

      const refund = await stripeService.createRefund({
        paymentIntentId: paymentIntent.id,
        amount: 5000, // Refund $50
      });

      expect(refund.amount).toBe(5000);
    });
  });

  describe('Webhook Handling', () => {
    it('should verify webhook signature', async () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: {} },
      });

      const signature = stripeService.generateWebhookSignature(payload);

      const verified = stripeService.verifyWebhookSignature(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      expect(verified).toBe(true);
    });

    it('should construct webhook event', async () => {
      const payload = JSON.stringify({
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test',
            customer: 'cus_test',
          },
        },
      });

      const signature = stripeService.generateWebhookSignature(payload);

      const event = stripeService.constructWebhookEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      expect(event.type).toBe('customer.subscription.created');
    });

    it('should reject invalid webhook signatures', async () => {
      const payload = JSON.stringify({ type: 'test.event' });
      const invalidSignature = 'invalid-signature';

      expect(() => {
        stripeService.verifyWebhookSignature(
          payload,
          invalidSignature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      }).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle card declined errors', async () => {
      const customer = await stripeService.createCustomer({
        email: 'declined@example.com',
        name: 'Declined Test',
      });

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 100,
        currency: 'usd',
        customerId: customer.id,
      });

      await expect(
        stripeService.confirmPaymentIntent(paymentIntent.id, 'pm_card_chargeDeclined')
      ).rejects.toThrow();
    });

    it('should handle insufficient funds errors', async () => {
      const customer = await stripeService.createCustomer({
        email: 'insufficient@example.com',
        name: 'Insufficient Funds Test',
      });

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: 100,
        currency: 'usd',
        customerId: customer.id,
      });

      await expect(
        stripeService.confirmPaymentIntent(paymentIntent.id, 'pm_card_insufficientFunds')
      ).rejects.toThrow();
    });

    it('should handle rate limit errors', async () => {
      // This would require making excessive requests
      // Implementation depends on Stripe test mode limits
    });

    it('should handle network errors gracefully', async () => {
      const invalidService = new StripeService({
        apiKey: 'invalid-key',
      });

      await expect(
        invalidService.createCustomer({
          email: 'test@example.com',
          name: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('Idempotency', () => {
    it('should support idempotent requests', async () => {
      const idempotencyKey = `idem-${Date.now()}`;

      const customer1 = await stripeService.createCustomer({
        email: 'idempotent@example.com',
        name: 'Idempotent Test',
      }, {
        idempotencyKey,
      });

      // Same request with same idempotency key
      const customer2 = await stripeService.createCustomer({
        email: 'idempotent@example.com',
        name: 'Idempotent Test',
      }, {
        idempotencyKey,
      });

      expect(customer1.id).toBe(customer2.id);
    });
  });

  describe('Metadata', () => {
    it('should support metadata on all objects', async () => {
      const metadata = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        environment: 'test',
      };

      const customer = await stripeService.createCustomer({
        email: 'metadata@example.com',
        name: 'Metadata Test',
        metadata,
      });

      expect(customer.metadata.userId).toBe(metadata.userId);
      expect(customer.metadata.tenantId).toBe(metadata.tenantId);
    });
  });
});

