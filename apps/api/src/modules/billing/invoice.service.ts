import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StripeService } from './stripe.service';
import { InvoiceDto, InvoiceLineItemDto, InvoiceQueryParams } from './dto/invoice.dto';
import Stripe from 'stripe';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  /**
   * List invoices for a tenant
   */
  async listInvoices(
    tenantId: string,
    queryParams?: InvoiceQueryParams,
  ): Promise<InvoiceDto[]> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const stripeCustomerId = tenant.settings?.['stripeCustomerId'] as string;

      if (!stripeCustomerId) {
        return [];
      }

      const stripeInvoices = await this.stripeService.listInvoices({
        customerId: stripeCustomerId,
        limit: queryParams?.limit || 10,
        status: queryParams?.status,
      });

      return stripeInvoices.map(invoice => this.mapStripeInvoiceToDto(invoice));
    } catch (error) {
      this.logger.error('Failed to list invoices', error.stack);
      throw error;
    }
  }

  /**
   * Get a specific invoice
   */
  async getInvoice(tenantId: string, invoiceId: string): Promise<InvoiceDto> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const stripeInvoice = await this.stripeService.getInvoice(invoiceId);

      // Verify invoice belongs to tenant's customer
      const stripeCustomerId = tenant.settings?.['stripeCustomerId'] as string;
      if (stripeInvoice.customer !== stripeCustomerId) {
        throw new NotFoundException('Invoice not found');
      }

      return this.mapStripeInvoiceToDto(stripeInvoice);
    } catch (error) {
      this.logger.error('Failed to get invoice', error.stack);
      throw error;
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(tenantId: string, invoiceId: string): Promise<string> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const stripeInvoice = await this.stripeService.getInvoice(invoiceId);

      // Verify invoice belongs to tenant's customer
      const stripeCustomerId = tenant.settings?.['stripeCustomerId'] as string;
      if (stripeInvoice.customer !== stripeCustomerId) {
        throw new NotFoundException('Invoice not found');
      }

      return stripeInvoice.invoice_pdf || '';
    } catch (error) {
      this.logger.error('Failed to download invoice', error.stack);
      throw error;
    }
  }

  /**
   * Get upcoming invoice (preview of next billing cycle)
   */
  async getUpcomingInvoice(tenantId: string): Promise<InvoiceDto | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const stripeCustomerId = tenant.settings?.['stripeCustomerId'] as string;

      if (!stripeCustomerId) {
        return null;
      }

      // Get upcoming invoice from Stripe
      const stripeInvoice = await this.stripeService['stripe'].invoices.retrieveUpcoming({
        customer: stripeCustomerId,
      });

      return this.mapStripeInvoiceToDto(stripeInvoice);
    } catch (error) {
      // If there's no upcoming invoice, return null instead of throwing
      if (error.code === 'invoice_upcoming_none') {
        return null;
      }
      
      this.logger.error('Failed to get upcoming invoice', error.stack);
      throw error;
    }
  }

  /**
   * Map Stripe invoice to DTO
   */
  private mapStripeInvoiceToDto(invoice: Stripe.Invoice): InvoiceDto {
    const lineItems: InvoiceLineItemDto[] = invoice.lines.data.map(line => ({
      description: line.description || '',
      quantity: line.quantity || 0,
      unitAmount: line.price?.unit_amount || 0,
      amount: line.amount,
    }));

    return {
      id: invoice.id,
      invoiceNumber: invoice.number || invoice.id,
      status: invoice.status || 'draft',
      amount: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      invoiceDate: new Date(invoice.created * 1000),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
      paidDate: invoice.status_transitions.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000) 
        : undefined,
      lineItems,
      pdfUrl: invoice.invoice_pdf || undefined,
      hostedUrl: invoice.hosted_invoice_url || undefined,
    };
  }
}

