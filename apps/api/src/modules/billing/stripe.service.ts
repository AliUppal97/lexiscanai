import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BillingPlan } from '@prisma/client';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  // Plan pricing in cents
  private readonly PLAN_PRICES = {
    FREE: 0,
    BASIC: 2900, // $29/month
    PREMIUM: 7900, // $79/month
    ENTERPRISE: 19900, // $199/month base + per seat
  };

  private readonly ENTERPRISE_SEAT_PRICE = 1900; // $19 per additional seat

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured. Billing features will be unavailable.');
    }

    this.stripe = new Stripe(apiKey || 'sk_test_dummy', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(params: {
    email: string;
    name: string;
    tenantId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: {
          tenantId: params.tenantId,
          ...params.metadata,
        },
      });

      this.logger.log(`Created Stripe customer: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Failed to create Stripe customer', error.stack);
      throw new BadRequestException('Failed to create customer in payment system');
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      this.logger.log(`Attached payment method ${paymentMethodId} to customer ${customerId}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error('Failed to attach payment method', error.stack);
      throw new BadRequestException('Failed to attach payment method');
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(params: {
    customerId: string;
    plan: BillingPlan;
    paymentMethodId?: string;
    couponCode?: string;
    seats?: number;
  }): Promise<Stripe.Subscription> {
    try {
      if (params.plan === BillingPlan.FREE) {
        throw new BadRequestException('Cannot create subscription for FREE plan');
      }

      // Attach payment method if provided
      if (params.paymentMethodId) {
        await this.attachPaymentMethod(params.paymentMethodId, params.customerId);
      }

      const basePrice = this.PLAN_PRICES[params.plan];
      const seats = params.seats || 1;
      
      // Calculate total price for enterprise with seats
      let totalPrice = basePrice;
      if (params.plan === BillingPlan.ENTERPRISE && seats > 1) {
        totalPrice = basePrice + (seats - 1) * this.ENTERPRISE_SEAT_PRICE;
      }

      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: params.customerId,
        items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `LexiScan AI ${params.plan} Plan`,
                description: `${params.plan} subscription${params.plan === BillingPlan.ENTERPRISE ? ` for ${seats} seats` : ''}`,
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: totalPrice,
            },
            quantity: 1,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          plan: params.plan,
          seats: seats.toString(),
        },
      };

      // Apply coupon if provided
      if (params.couponCode) {
        subscriptionParams.coupon = params.couponCode;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      this.logger.log(`Created subscription ${subscription.id} for customer ${params.customerId}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription', error.stack);
      throw new BadRequestException(error.message || 'Failed to create subscription');
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(params: {
    subscriptionId: string;
    plan?: BillingPlan;
    seats?: number;
    paymentMethodId?: string;
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(params.subscriptionId);

      // Update payment method if provided
      if (params.paymentMethodId) {
        await this.attachPaymentMethod(
          params.paymentMethodId,
          subscription.customer as string,
        );
      }

      const updateParams: Stripe.SubscriptionUpdateParams = {};

      // Update plan and pricing if provided
      if (params.plan && params.plan !== BillingPlan.FREE) {
        const basePrice = this.PLAN_PRICES[params.plan];
        const seats = params.seats || 1;
        
        let totalPrice = basePrice;
        if (params.plan === BillingPlan.ENTERPRISE && seats > 1) {
          totalPrice = basePrice + (seats - 1) * this.ENTERPRISE_SEAT_PRICE;
        }

        updateParams.items = [
          {
            id: subscription.items.data[0].id,
            price_data: {
              currency: 'usd',
              product_data: {
                name: `LexiScan AI ${params.plan} Plan`,
                description: `${params.plan} subscription${params.plan === BillingPlan.ENTERPRISE ? ` for ${seats} seats` : ''}`,
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: totalPrice,
            },
            quantity: 1,
          },
        ];

        updateParams.metadata = {
          plan: params.plan,
          seats: seats.toString(),
        };

        updateParams.proration_behavior = 'create_prorations';
      }

      const updatedSubscription = await this.stripe.subscriptions.update(
        params.subscriptionId,
        updateParams,
      );

      this.logger.log(`Updated subscription ${params.subscriptionId}`);
      return updatedSubscription;
    } catch (error) {
      this.logger.error('Failed to update subscription', error.stack);
      throw new BadRequestException('Failed to update subscription');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = immediately
        ? await this.stripe.subscriptions.cancel(subscriptionId)
        : await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });

      this.logger.log(`Cancelled subscription ${subscriptionId} (immediate: ${immediately})`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to cancel subscription', error.stack);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error('Failed to retrieve subscription', error.stack);
      throw new BadRequestException('Failed to retrieve subscription');
    }
  }

  /**
   * List invoices for customer
   */
  async listInvoices(params: {
    customerId: string;
    limit?: number;
    status?: string;
  }): Promise<Stripe.Invoice[]> {
    try {
      const response = await this.stripe.invoices.list({
        customer: params.customerId,
        limit: params.limit || 10,
        status: params.status as any,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to list invoices', error.stack);
      throw new BadRequestException('Failed to retrieve invoices');
    }
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      this.logger.error('Failed to retrieve invoice', error.stack);
      throw new BadRequestException('Failed to retrieve invoice');
    }
  }

  /**
   * Create payment intent for one-time payment
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId: string;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        customer: params.customerId,
        description: params.description,
        automatic_payment_methods: { enabled: true },
      });
    } catch (error) {
      this.logger.error('Failed to create payment intent', error.stack);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error.stack);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get plan pricing
   */
  getPlanPrice(plan: BillingPlan, seats: number = 1): number {
    const basePrice = this.PLAN_PRICES[plan];
    
    if (plan === BillingPlan.ENTERPRISE && seats > 1) {
      return basePrice + (seats - 1) * this.ENTERPRISE_SEAT_PRICE;
    }
    
    return basePrice;
  }
}

