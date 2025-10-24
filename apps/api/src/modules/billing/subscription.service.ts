import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StripeService } from './stripe.service';
import { Billing, BillingPlan, BillingStatus } from '@prisma/client';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(
    tenantId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Billing> {
    // Verify user exists and belongs to tenant
    const user = await this.prisma.user.findFirst({
      where: {
        id: dto.userId,
        tenantId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.prisma.billing.findFirst({
      where: {
        userId: dto.userId,
        tenantId,
        status: BillingStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Free plan doesn't require Stripe
    if (dto.plan === BillingPlan.FREE) {
      return this.createFreeSubscription(tenantId, dto.userId);
    }

    // Create Stripe customer if not exists
    let stripeCustomerId = user.email; // In real implementation, store this in user metadata

    try {
      const stripeCustomer = await this.stripeService.createCustomer(
        user.email,
        tenantId,
        dto.userId,
      );
      stripeCustomerId = stripeCustomer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`);
    }

    // Create Stripe subscription
    const stripeSubscription = await this.stripeService.createSubscription(
      stripeCustomerId,
      dto.plan,
      dto.paymentMethodId,
    );

    // Get plan pricing
    const pricing = this.stripeService.getPlanPricing(dto.plan);

    // Calculate period
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (dto.billingPeriodMonths || 1));

    // Create billing record
    const billing = await this.prisma.billing.create({
      data: {
        userId: dto.userId,
        tenantId,
        plan: dto.plan,
        status: BillingStatus.ACTIVE,
        amount: pricing.amount / 100, // Convert cents to dollars
        currency: dto.currency || 'USD',
        periodStart,
        periodEnd,
      },
    });

    // Create audit log
    await this.createAuditLog(
      tenantId,
      dto.userId,
      'subscription.created',
      billing.id,
      { plan: dto.plan, stripeSubscriptionId: stripeSubscription.id },
    );

    this.logger.log(`Created subscription ${billing.id} for user ${dto.userId}`);

    return billing;
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
    // Find subscription
    const subscription = await this.prisma.billing.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
        userId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // If changing plan, update Stripe subscription
    if (dto.plan && dto.plan !== subscription.plan) {
      // Handle plan change logic
      const pricing = this.stripeService.getPlanPricing(dto.plan);
      
      // Update in database
      const updated = await this.prisma.billing.update({
        where: { id: subscriptionId },
        data: {
          plan: dto.plan,
          amount: pricing.amount / 100,
          updatedAt: new Date(),
        },
      });

      // Create audit log
      await this.createAuditLog(
        tenantId,
        userId,
        'subscription.plan_changed',
        subscriptionId,
        { oldPlan: subscription.plan, newPlan: dto.plan },
      );

      this.logger.log(`Updated subscription ${subscriptionId} plan from ${subscription.plan} to ${dto.plan}`);

      return updated;
    }

    // If changing status
    if (dto.status && dto.status !== subscription.status) {
      const updated = await this.prisma.billing.update({
        where: { id: subscriptionId },
        data: {
          status: dto.status,
          updatedAt: new Date(),
        },
      });

      // Create audit log
      await this.createAuditLog(
        tenantId,
        userId,
        'subscription.status_changed',
        subscriptionId,
        { oldStatus: subscription.status, newStatus: dto.status },
      );

      return updated;
    }

    return subscription;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    tenantId: string,
    subscriptionId: string,
    userId: string,
  ): Promise<Billing> {
    const subscription = await this.prisma.billing.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
        userId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === BillingStatus.CANCELLED) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    // Update status to cancelled
    const cancelled = await this.prisma.billing.update({
      where: { id: subscriptionId },
      data: {
        status: BillingStatus.CANCELLED,
        periodEnd: new Date(), // End immediately
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await this.createAuditLog(
      tenantId,
      userId,
      'subscription.cancelled',
      subscriptionId,
      { plan: subscription.plan },
    );

    this.logger.log(`Cancelled subscription ${subscriptionId}`);

    return cancelled;
  }

  /**
   * Get subscription details
   */
  async getSubscription(
    tenantId: string,
    subscriptionId: string,
    userId: string,
  ): Promise<Billing> {
    const subscription = await this.prisma.billing.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
        userId,
      },
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
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * Get user's active subscription
   */
  async getActiveSubscription(
    tenantId: string,
    userId: string,
  ): Promise<Billing | null> {
    return this.prisma.billing.findFirst({
      where: {
        userId,
        tenantId,
        status: BillingStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * List all subscriptions for a tenant
   */
  async listSubscriptions(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ subscriptions: Billing[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.billing.findMany({
        where: { tenantId },
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
      this.prisma.billing.count({
        where: { tenantId },
      }),
    ]);

    return {
      subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Check if subscription has expired
   */
  async checkAndUpdateExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.billing.updateMany({
      where: {
        status: BillingStatus.ACTIVE,
        periodEnd: {
          lt: now,
        },
      },
      data: {
        status: BillingStatus.EXPIRED,
        updatedAt: now,
      },
    });

    this.logger.log(`Updated ${result.count} expired subscriptions`);

    return result.count;
  }

  /**
   * Private helper methods
   */
  private async createFreeSubscription(
    tenantId: string,
    userId: string,
  ): Promise<Billing> {
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 10); // 10 years for free plan

    return this.prisma.billing.create({
      data: {
        userId,
        tenantId,
        plan: BillingPlan.FREE,
        status: BillingStatus.ACTIVE,
        amount: 0,
        currency: 'USD',
        periodStart,
        periodEnd,
      },
    });
  }

  private async createAuditLog(
    tenantId: string,
    userId: string,
    action: string,
    resourceId: string,
    details: any,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          resource: 'subscription',
          resourceId,
          details,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }
}
