import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StripeService } from './stripe.service';
import { InvoiceDto, QueryInvoicesDto, InvoiceStatus } from './dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  /**
   * Get invoice by ID
   */
  async getInvoice(
    tenantId: string,
    userId: string,
    invoiceId: string,
  ): Promise<InvoiceDto> {
    // Find billing record
    const billing = await this.prisma.billing.findFirst({
      where: {
        id: invoiceId,
        tenantId,
        userId,
      },
    });

    if (!billing) {
      throw new NotFoundException('Invoice not found');
    }

    // Map to invoice DTO
    return this.mapBillingToInvoice(billing);
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
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId,
      userId,
    };

    if (status) {
      where.status = this.mapInvoiceStatusToBillingStatus(status);
    }

    // Get invoices and total count
    const [billings, total] = await Promise.all([
      this.prisma.billing.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.billing.count({ where }),
    ]);

    // Map to invoice DTOs
    const invoices = billings.map((billing) => this.mapBillingToInvoice(billing));

    return {
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId,
    };

    if (status) {
      where.status = this.mapInvoiceStatusToBillingStatus(status);
    }

    // Get invoices and total count
    const [billings, total] = await Promise.all([
      this.prisma.billing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.billing.count({ where }),
    ]);

    // Map to invoice DTOs
    const invoices = billings.map((billing) => this.mapBillingToInvoice(billing));

    return {
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(
    tenantId: string,
    userId: string,
    invoiceId: string,
  ): Promise<{ url: string }> {
    // Find billing record
    const billing = await this.prisma.billing.findFirst({
      where: {
        id: invoiceId,
        tenantId,
        userId,
      },
    });

    if (!billing) {
      throw new NotFoundException('Invoice not found');
    }

    // In production, retrieve actual Stripe invoice
    // const stripeInvoice = await this.stripeService.retrieveInvoice(billing.stripeInvoiceId);
    // return { url: stripeInvoice.invoice_pdf };

    // Mock response
    return {
      url: `https://invoice.stripe.com/i/acct_test/${invoiceId}/pdf`,
    };
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
    // Get all invoices
    const billings = await this.prisma.billing.findMany({
      where: { tenantId },
      select: {
        amount: true,
        status: true,
      },
    });

    // Calculate statistics
    const totalInvoices = billings.length;
    const totalRevenue = billings.reduce((sum, b) => sum + Number(b.amount), 0);
    const paidInvoices = billings.filter((b) => b.status === 'ACTIVE').length;
    const pendingInvoices = billings.filter((b) => b.status === 'PAST_DUE').length;
    const failedInvoices = billings.filter((b) => b.status === 'CANCELLED').length;
    const averageInvoiceAmount = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalRevenue,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      failedInvoices,
      averageInvoiceAmount,
    };
  }

  /**
   * Private helper methods
   */
  private mapBillingToInvoice(billing: any): InvoiceDto {
    return {
      id: billing.id,
      billingId: billing.id,
      amount: Math.round(Number(billing.amount) * 100), // Convert to cents
      currency: billing.currency,
      status: this.mapBillingStatusToInvoiceStatus(billing.status),
      stripeInvoiceId: undefined, // Would be stored in production
      invoiceUrl: `https://invoice.stripe.com/i/acct_test/${billing.id}`,
      createdAt: billing.createdAt,
      dueDate: billing.periodEnd,
    };
  }

  private mapBillingStatusToInvoiceStatus(status: string): InvoiceStatus {
    const mapping: Record<string, InvoiceStatus> = {
      ACTIVE: InvoiceStatus.PAID,
      CANCELLED: InvoiceStatus.FAILED,
      EXPIRED: InvoiceStatus.FAILED,
      PAST_DUE: InvoiceStatus.PENDING,
    };

    return mapping[status] || InvoiceStatus.PENDING;
  }

  private mapInvoiceStatusToBillingStatus(status: InvoiceStatus): string {
    const mapping: Record<InvoiceStatus, string> = {
      [InvoiceStatus.PAID]: 'ACTIVE',
      [InvoiceStatus.FAILED]: 'CANCELLED',
      [InvoiceStatus.PENDING]: 'PAST_DUE',
      [InvoiceStatus.DRAFT]: 'ACTIVE',
      [InvoiceStatus.REFUNDED]: 'CANCELLED',
    };

    return mapping[status];
  }
}
