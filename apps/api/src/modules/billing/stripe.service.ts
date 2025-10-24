import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingPlan } from '@prisma/client';

// Stripe types (to avoid adding full stripe dependency in this example)
// In production, install: npm install stripe @types/stripe
interface StripeCustomer {
  id: string;
  email: string;
  metadata: Record<string, string>;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      price: { id: string };
    }>;
  };
}

interface StripeInvoice {
  id: string;
  amount_due: number;
  currency: string;
  status: string;
  hosted_invoice_url: string;
  invoice_pdf: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripeEnabled: boolean;

  // Pricing configuration
  private readonly pricingPlans = {
    [BillingPlan.FREE]: { priceId: null, amount: 0 },
    [BillingPlan.BASIC]: { priceId: process.env.STRIPE_BASIC_PRICE_ID, amount: 2999 }, // $29.99
    [BillingPlan.PREMIUM]: { priceId: process.env.STRIPE_PREMIUM_PRICE_ID, amount: 9999 }, // $99.99
    [BillingPlan.ENTERPRISE]: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID, amount: 29999 }, // $299.99
  };

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripeEnabled = !!stripeSecretKey;

    if (!this.stripeEnabled) {
      this.logger.warn('Stripe is not configured. Billing features will be limited.');
    }
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(
    email: string,
    tenantId: string,
    userId: string,
    metadata?: Record<string, string>,
  ): Promise<StripeCustomer> {
    this.ensureStripeEnabled();

    try {
      // In production, use actual Stripe SDK:
      // const customer = await this.stripe.customers.create({
      //   email,
      //   metadata: { tenantId, userId, ...metadata },
      // });

      this.logger.log(`Creating Stripe customer for user ${userId}`);

      // Mock response for development
      return {
        id: `cus_${this.generateId()}`,
        email,
        metadata: { tenantId, userId, ...metadata },
      };
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(
    customerId: string,
    plan: BillingPlan,
    paymentMethodId: string,
  ): Promise<StripeSubscription> {
    this.ensureStripeEnabled();

    const planConfig = this.pricingPlans[plan];
    if (!planConfig.priceId) {
      throw new BadRequestException(`Plan ${plan} does not require a subscription`);
    }

    try {
      // Attach payment method to customer
      // await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

      // Set as default payment method
      // await this.stripe.customers.update(customerId, {
      //   invoice_settings: { default_payment_method: paymentMethodId },
      // });

      // Create subscription
      // const subscription = await this.stripe.subscriptions.create({
      //   customer: customerId,
      //   items: [{ price: planConfig.priceId }],
      //   payment_behavior: 'default_incomplete',
      //   expand: ['latest_invoice.payment_intent'],
      // });

      this.logger.log(`Creating subscription for customer ${customerId} with plan ${plan}`);

      const now = Date.now() / 1000;
      return {
        id: `sub_${this.generateId()}`,
        customer: customerId,
        status: 'active',
        current_period_start: now,
        current_period_end: now + 30 * 24 * 60 * 60, // 30 days
        items: {
          data: [{ price: { id: planConfig.priceId } }],
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(
    subscriptionId: string,
    newPlan: BillingPlan,
  ): Promise<StripeSubscription> {
    this.ensureStripeEnabled();

    const planConfig = this.pricingPlans[newPlan];
    if (!planConfig.priceId) {
      throw new BadRequestException(`Plan ${newPlan} does not require a subscription`);
    }

    try {
      // Get current subscription
      // const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      // Update subscription
      // const updated = await this.stripe.subscriptions.update(subscriptionId, {
      //   items: [
      //     {
      //       id: subscription.items.data[0].id,
      //       price: planConfig.priceId,
      //     },
      //   ],
      //   proration_behavior: 'always_invoice',
      // });

      this.logger.log(`Updating subscription ${subscriptionId} to plan ${newPlan}`);

      const now = Date.now() / 1000;
      return {
        id: subscriptionId,
        customer: `cus_${this.generateId()}`,
        status: 'active',
        current_period_start: now,
        current_period_end: now + 30 * 24 * 60 * 60,
        items: {
          data: [{ price: { id: planConfig.priceId } }],
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update subscription: ${error.message}`);
      throw new InternalServerErrorException('Failed to update subscription');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    this.ensureStripeEnabled();

    try {
      // await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`Cancelling subscription ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * Retrieve an invoice
   */
  async retrieveInvoice(invoiceId: string): Promise<StripeInvoice> {
    this.ensureStripeEnabled();

    try {
      // const invoice = await this.stripe.invoices.retrieve(invoiceId);
      this.logger.log(`Retrieving invoice ${invoiceId}`);

      return {
        id: invoiceId,
        amount_due: 2999,
        currency: 'usd',
        status: 'paid',
        hosted_invoice_url: `https://invoice.stripe.com/i/acct_test/${invoiceId}`,
        invoice_pdf: `https://invoice.stripe.com/i/acct_test/${invoiceId}/pdf`,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve invoice: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve invoice');
    }
  }

  /**
   * List all invoices for a customer
   */
  async listInvoices(customerId: string, limit: number = 10): Promise<StripeInvoice[]> {
    this.ensureStripeEnabled();

    try {
      // const invoices = await this.stripe.invoices.list({
      //   customer: customerId,
      //   limit,
      // });

      this.logger.log(`Listing invoices for customer ${customerId}`);

      // Mock response
      return [
        {
          id: `in_${this.generateId()}`,
          amount_due: 2999,
          currency: 'usd',
          status: 'paid',
          hosted_invoice_url: `https://invoice.stripe.com/i/acct_test/in_test`,
          invoice_pdf: `https://invoice.stripe.com/i/acct_test/in_test/pdf`,
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to list invoices: ${error.message}`);
      throw new InternalServerErrorException('Failed to list invoices');
    }
  }

  /**
   * Get plan pricing
   */
  getPlanPricing(plan: BillingPlan): { amount: number; priceId: string | null } {
    return this.pricingPlans[plan];
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    this.ensureStripeEnabled();

    try {
      // const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      // const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      // return !!event;

      this.logger.log('Validating webhook signature');
      return true; // Mock validation
    } catch (error) {
      this.logger.error(`Invalid webhook signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper methods
   */
  private ensureStripeEnabled(): void {
    if (!this.stripeEnabled) {
      throw new InternalServerErrorException('Stripe is not configured');
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
