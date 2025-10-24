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
  Request,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, PermissionsGuard } from '../auth/auth.guard';
import { BillingService } from './billing.service';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { StripeService } from './stripe.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InvoiceQueryParams } from './dto/invoice.dto';
import { BillingStatus } from '@prisma/client';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(
    private billingService: BillingService,
    private subscriptionService: SubscriptionService,
    private invoiceService: InvoiceService,
    private stripeService: StripeService,
  ) {}

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  @Post('subscriptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSubscription(
    @Request() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscription(
      req.user.sub,
      req.tenantId,
      createSubscriptionDto,
    );
  }

  @Put('subscriptions/:id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(
    @Request() req,
    @Param('id') subscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.updateSubscription(
      req.user.sub,
      req.tenantId,
      subscriptionId,
      updateSubscriptionDto,
    );
  }

  @Delete('subscriptions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiQuery({ name: 'immediately', required: false, type: Boolean })
  @ApiResponse({ status: 204, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancelSubscription(
    @Request() req,
    @Param('id') subscriptionId: string,
    @Query('immediately') immediately?: boolean,
  ) {
    await this.subscriptionService.cancelSubscription(
      req.user.sub,
      req.tenantId,
      subscriptionId,
      immediately === true || immediately === 'true' as any,
    );
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscription(@Request() req, @Param('id') subscriptionId: string) {
    return this.subscriptionService.getSubscription(
      req.user.sub,
      req.tenantId,
      subscriptionId,
    );
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List all subscriptions for tenant' })
  @ApiQuery({ name: 'status', required: false, enum: BillingStatus })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved' })
  async listSubscriptions(@Request() req, @Query('status') status?: BillingStatus) {
    return this.subscriptionService.listSubscriptions(req.tenantId, status);
  }

  @Get('subscriptions/current/details')
  @ApiOperation({ summary: 'Get current active subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription retrieved' })
  async getCurrentSubscription(@Request() req) {
    return this.subscriptionService.getCurrentSubscription(req.tenantId);
  }

  // ============================================================================
  // INVOICES
  // ============================================================================

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices for tenant' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Invoices retrieved' })
  async listInvoices(
    @Request() req,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    const queryParams: InvoiceQueryParams = {
      status: status as any,
      limit: limit ? parseInt(limit.toString()) : undefined,
    };

    return this.invoiceService.listInvoices(req.tenantId, queryParams);
  }

  @Get('invoices/upcoming')
  @ApiOperation({ summary: 'Get upcoming invoice preview' })
  @ApiResponse({ status: 200, description: 'Upcoming invoice retrieved' })
  async getUpcomingInvoice(@Request() req) {
    return this.invoiceService.getUpcomingInvoice(req.tenantId);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice details retrieved' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoice(@Request() req, @Param('id') invoiceId: string) {
    return this.invoiceService.getInvoice(req.tenantId, invoiceId);
  }

  @Get('invoices/:id/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice PDF URL' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadInvoice(@Request() req, @Param('id') invoiceId: string) {
    const pdfUrl = await this.invoiceService.downloadInvoice(req.tenantId, invoiceId);
    return { pdfUrl };
  }

  // ============================================================================
  // BILLING OVERVIEW & STATISTICS
  // ============================================================================

  @Get('overview')
  @ApiOperation({ summary: 'Get billing overview' })
  @ApiResponse({ status: 200, description: 'Billing overview retrieved' })
  async getBillingOverview(@Request() req) {
    return this.billingService.getBillingOverview(req.tenantId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get billing statistics' })
  @ApiResponse({ status: 200, description: 'Billing statistics retrieved' })
  async getBillingStatistics(@Request() req) {
    return this.billingService.getBillingStatistics(req.tenantId);
  }

  // ============================================================================
  // STRIPE WEBHOOK
  // ============================================================================

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Verify webhook signature
    const event = this.stripeService.verifyWebhookSignature(
      req.rawBody || '',
      signature,
    );

    // Process webhook event
    await this.billingService.handleWebhookEvent(event);

    return { received: true };
  }
}

