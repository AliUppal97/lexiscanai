import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  QueryInvoicesDto,
  InvoiceDto,
} from './dto';
import { Billing } from '@prisma/client';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ========== Subscription Endpoints ==========

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or user already has active subscription',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  async createSubscription(
    @Req() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Billing> {
    const tenantId = req.tenantId;
    return this.billingService.createSubscription(tenantId, createSubscriptionDto);
  }

  @Get('subscriptions/active')
  @ApiOperation({ summary: 'Get current user active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Returns active subscription or null',
  })
  async getActiveSubscription(@Req() req: any): Promise<Billing | null> {
    const { tenantId, user } = req;
    return this.billingService.getActiveSubscription(tenantId, user.id);
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns subscription details',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async getSubscription(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<Billing> {
    const { tenantId, user } = req;
    return this.billingService.getSubscription(tenantId, id, user.id);
  }

  @Put('subscriptions/:id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async updateSubscription(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Billing> {
    const { tenantId, user } = req;
    return this.billingService.updateSubscription(tenantId, id, user.id, updateSubscriptionDto);
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async cancelSubscription(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<Billing> {
    const { tenantId, user } = req;
    return this.billingService.cancelSubscription(tenantId, id, user.id);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List all subscriptions for tenant (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of subscriptions',
  })
  async listSubscriptions(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ subscriptions: Billing[]; total: number; page: number; totalPages: number }> {
    const tenantId = req.tenantId;
    return this.billingService.listSubscriptions(tenantId, page, limit);
  }

  // ========== Invoice Endpoints ==========

  @Get('invoices/me')
  @ApiOperation({ summary: 'List invoices for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of user invoices',
  })
  async listMyInvoices(
    @Req() req: any,
    @Query() query: QueryInvoicesDto,
  ): Promise<{
    invoices: InvoiceDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { tenantId, user } = req;
    return this.billingService.listInvoices(tenantId, user.id, query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns invoice details',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
  })
  async getInvoice(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<InvoiceDto> {
    const { tenantId, user } = req;
    return this.billingService.getInvoice(tenantId, user.id, id);
  }

  @Get('invoices/:id/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiResponse({
    status: 200,
    description: 'Returns invoice download URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
  })
  async downloadInvoice(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<{ url: string }> {
    const { tenantId, user } = req;
    return this.billingService.downloadInvoice(tenantId, user.id, id);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List all invoices for tenant (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all tenant invoices',
  })
  async listTenantInvoices(
    @Req() req: any,
    @Query() query: QueryInvoicesDto,
  ): Promise<{
    invoices: InvoiceDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const tenantId = req.tenantId;
    return this.billingService.listTenantInvoices(tenantId, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get billing statistics for tenant (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns billing statistics',
  })
  async getStatistics(@Req() req: any): Promise<{
    totalRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    failedInvoices: number;
    averageInvoiceAmount: number;
  }> {
    const tenantId = req.tenantId;
    return this.billingService.getInvoiceStatistics(tenantId);
  }

  // ========== Webhook Endpoints ==========

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature',
  })
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const payload = JSON.stringify(body);
    await this.billingService.handleWebhook(payload, signature);
    return { received: true };
  }
}
