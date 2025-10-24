import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { StripeService } from './stripe.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private invoiceService: InvoiceService,
    private stripeService: StripeService,
  ) {}

  /**
   * Get billing overview for tenant
   */
  async getBillingOverview(tenantId: string) {
    try {
      // Get current subscription
      const currentSubscription = await this.subscriptionService.getCurrentSubscription(
        tenantId,
      );

      // Get recent invoices
      const recentInvoices = await this.invoiceService.listInvoices(tenantId, {
        limit: 5,
      });

      // Get upcoming invoice
      const upcomingInvoice = await this.invoiceService.getUpcomingInvoice(tenantId);

      // Get payment method info
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      let paymentMethod = null;
      const stripeCustomerId = tenant?.settings?.['stripeCustomerId'] as string;

      if (stripeCustomerId) {
        try {
          const customer = await this.stripeService['stripe'].customers.retrieve(
            stripeCustomerId,
          );
          
          if ('invoice_settings' in customer && customer.invoice_settings?.default_payment_method) {
            const pm = await this.stripeService['stripe'].paymentMethods.retrieve(
              customer.invoice_settings.default_payment_method as string,
            );
            
            paymentMethod = {
              type: pm.type,
              last4: pm.card?.last4,
              brand: pm.card?.brand,
              expiryMonth: pm.card?.exp_month,
              expiryYear: pm.card?.exp_year,
            };
          }
        } catch (error) {
          this.logger.warn('Failed to retrieve payment method', error.message);
        }
      }

      return {
        currentSubscription,
        recentInvoices,
        upcomingInvoice,
        paymentMethod,
      };
    } catch (error) {
      this.logger.error('Failed to get billing overview', error.stack);
      throw error;
    }
  }

  /**
   * Get billing statistics
   */
  async getBillingStatistics(tenantId: string) {
    try {
      const [totalSpent, subscriptionCount, invoiceCount] = await Promise.all([
        this.prisma.billing.aggregate({
          where: { tenantId },
          _sum: { amount: true },
        }),
        this.prisma.billing.count({
          where: { tenantId },
        }),
        this.prisma.billing.count({
          where: {
            tenantId,
            periodEnd: { lte: new Date() },
          },
        }),
      ]);

      return {
        totalSpent: totalSpent._sum.amount || 0,
        subscriptionCount,
        invoiceCount,
      };
    } catch (error) {
      this.logger.error('Failed to get billing statistics', error.stack);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: any) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook event: ${event.type}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(subscription: any) {
    const customerId = subscription.customer;
    
    // Find tenant by Stripe customer ID
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        settings: {
          path: ['stripeCustomerId'],
          equals: customerId,
        },
      },
    });

    if (!tenant) {
      this.logger.warn(`Tenant not found for Stripe customer: ${customerId}`);
      return;
    }

    // Update billing record
    await this.prisma.billing.updateMany({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      data: {
        periodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Updated subscription for tenant: ${tenant.id}`);
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: any) {
    const customerId = subscription.customer;
    
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        settings: {
          path: ['stripeCustomerId'],
          equals: customerId,
        },
      },
    });

    if (!tenant) {
      this.logger.warn(`Tenant not found for Stripe customer: ${customerId}`);
      return;
    }

    // Mark subscription as cancelled
    await this.prisma.billing.updateMany({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        periodEnd: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Cancelled subscription for tenant: ${tenant.id}`);
  }

  /**
   * Handle invoice paid event
   */
  private async handleInvoicePaid(invoice: any) {
    const customerId = invoice.customer;
    
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        settings: {
          path: ['stripeCustomerId'],
          equals: customerId,
        },
      },
    });

    if (!tenant) {
      this.logger.warn(`Tenant not found for Stripe customer: ${customerId}`);
      return;
    }

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: 'invoice.paid',
        resource: 'invoice',
        resourceId: invoice.id,
        details: {
          amount: invoice.amount_paid,
          currency: invoice.currency,
        },
      },
    });

    this.logger.log(`Invoice paid for tenant: ${tenant.id}, amount: ${invoice.amount_paid}`);
  }

  /**
   * Handle invoice payment failed event
   */
  private async handleInvoicePaymentFailed(invoice: any) {
    const customerId = invoice.customer;
    
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        settings: {
          path: ['stripeCustomerId'],
          equals: customerId,
        },
      },
    });

    if (!tenant) {
      this.logger.warn(`Tenant not found for Stripe customer: ${customerId}`);
      return;
    }

    // Update billing status to PAST_DUE
    await this.prisma.billing.updateMany({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'PAST_DUE',
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: 'invoice.payment_failed',
        resource: 'invoice',
        resourceId: invoice.id,
        details: {
          amount: invoice.amount_due,
          currency: invoice.currency,
          attemptCount: invoice.attempt_count,
        },
      },
    });

    this.logger.warn(`Invoice payment failed for tenant: ${tenant.id}`);
  }

  /**
   * Handle trial will end event
   */
  private async handleTrialWillEnd(subscription: any) {
    const customerId = subscription.customer;
    
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        settings: {
          path: ['stripeCustomerId'],
          equals: customerId,
        },
      },
    });

    if (!tenant) {
      this.logger.warn(`Tenant not found for Stripe customer: ${customerId}`);
      return;
    }

    // Log audit event for notification purposes
    await this.prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: 'subscription.trial_ending',
        resource: 'subscription',
        details: {
          trialEnd: new Date(subscription.trial_end * 1000),
        },
      },
    });

    this.logger.log(`Trial ending soon for tenant: ${tenant.id}`);
  }
}

