import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { StripeService } from './stripe.service';
import { 
  CreateSubscriptionDto, 
  UpdateSubscriptionDto, 
  QueryInvoicesDto,
  InvoiceDto 
} from './dto';
import { Billing } from '@prisma/client';

/**
 * Main billing service that coordinates subscription and invoice services
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private subscriptionService: SubscriptionService,
    private invoiceService: InvoiceService,
    private stripeService: StripeService,
  ) {}

  // ========== Subscription Methods ==========

  /**
   * Create a new subscription
   */
  async createSubscription(
    tenantId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Billing> {
    this.logger.log(`Creating subscription for tenant ${tenantId}`);
    return this.subscriptionService.createSubscription(tenantId, dto);
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(
    tenantId: string,
    subscriptionId: string,
    userId: string,
    dto: UpdateSubscriptionDto,
  ): Promise<Billing> {
    this.logger.log(`Updating subscription ${subscriptionId}`);
    return this.subscriptionService.updateSubscription(tenantId, subscriptionId, userId, dto);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    tenantId: string,
    subscriptionId: string,
    userId: string,
  ): Promise<Billing> {
    this.logger.log(`Cancelling subscription ${subscriptionId}`);
    return this.subscriptionService.cancelSubscription(tenantId, subscriptionId, userId);
  }

  /**
   * Get subscription details
   */
  async getSubscription(
    tenantId: string,
    subscriptionId: string,
    userId: string,
  ): Promise<Billing> {
    return this.subscriptionService.getSubscription(tenantId, subscriptionId, userId);
  }

  /**
   * Get user's active subscription
   */
  async getActiveSubscription(
    tenantId: string,
    userId: string,
  ): Promise<Billing | null> {
    return this.subscriptionService.getActiveSubscription(tenantId, userId);
  }

  /**
   * List all subscriptions for a tenant
   */
  async listSubscriptions(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ subscriptions: Billing[]; total: number; page: number; totalPages: number }> {
    return this.subscriptionService.listSubscriptions(tenantId, page, limit);
  }

  // ========== Invoice Methods ==========

  /**
   * Get invoice by ID
   */
  async getInvoice(
    tenantId: string,
    userId: string,
    invoiceId: string,
  ): Promise<InvoiceDto> {
    return this.invoiceService.getInvoice(tenantId, userId, invoiceId);
  }

  /**
   * List invoices for a user
   */
  async listInvoices(
    tenantId: string,
    userId: string,
    query: QueryInvoicesDto,
  ): Promise<{
    invoices: InvoiceDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.invoiceService.listInvoices(tenantId, userId, query);
  }

  /**
   * List all invoices for a tenant (admin only)
   */
  async listTenantInvoices(
    tenantId: string,
    query: QueryInvoicesDto,
  ): Promise<{
    invoices: InvoiceDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.invoiceService.listTenantInvoices(tenantId, query);
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(
    tenantId: string,
    userId: string,
    invoiceId: string,
  ): Promise<{ url: string }> {
    return this.invoiceService.downloadInvoice(tenantId, userId, invoiceId);
  }

  /**
   * Get invoice statistics for a tenant
   */
  async getInvoiceStatistics(tenantId: string): Promise<{
    totalRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    failedInvoices: number;
    averageInvoiceAmount: number;
  }> {
    return this.invoiceService.getInvoiceStatistics(tenantId);
  }

  // ========== Utility Methods ==========

  /**
   * Check and update expired subscriptions (cron job)
   */
  async checkExpiredSubscriptions(): Promise<number> {
    this.logger.log('Checking for expired subscriptions');
    return this.subscriptionService.checkAndUpdateExpiredSubscriptions();
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    const isValid = this.stripeService.validateWebhookSignature(payload, signature);

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }

    // Parse webhook event
    const event = JSON.parse(payload);

    this.logger.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
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
      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Private webhook handlers
   */
  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    this.logger.log(`Subscription created: ${subscription.id}`);
    // Implementation would sync with database
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    // Implementation would sync with database
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    // Implementation would sync with database
  }

  private async handleInvoicePaid(invoice: any): Promise<void> {
    this.logger.log(`Invoice paid: ${invoice.id}`);
    // Implementation would update invoice status
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);
    // Implementation would update invoice status and send notification
  }
}
