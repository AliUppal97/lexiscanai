import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StripeService } from './stripe.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { BillingPlan, BillingStatus } from '@prisma/client';
import Stripe from 'stripe';

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
    userId: string,
    tenantId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ) {
    try {
      // Get user and tenant
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true },
      });

      if (!user || user.tenantId !== tenantId) {
        throw new NotFoundException('User not found');
      }

      // Check if user already has an active subscription
      const existingBilling = await this.prisma.billing.findFirst({
        where: {
          tenantId,
          status: BillingStatus.ACTIVE,
        },
      });

      if (existingBilling) {
        throw new BadRequestException('An active subscription already exists');
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.tenant.settings?.['stripeCustomerId'] as string;

      if (!stripeCustomerId) {
        const customer = await this.stripeService.createCustomer({
          email: user.email,
          name: user.tenant.name,
          tenantId: tenantId,
        });
        stripeCustomerId = customer.id;

        // Update tenant with Stripe customer ID
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: {
            settings: {
              ...(user.tenant.settings as object),
              stripeCustomerId: customer.id,
            },
          },
        });
      }

      // Create Stripe subscription
      const stripeSubscription = await this.stripeService.createSubscription({
        customerId: stripeCustomerId,
        plan: createSubscriptionDto.plan,
        paymentMethodId: createSubscriptionDto.paymentMethodId,
        couponCode: createSubscriptionDto.couponCode,
        seats: createSubscriptionDto.seats,
      });

      // Calculate amount
      const seats = createSubscriptionDto.seats || 1;
      const amount = this.stripeService.getPlanPrice(createSubscriptionDto.plan, seats);

      // Create billing record
      const billing = await this.prisma.billing.create({
        data: {
          userId,
          tenantId,
          plan: createSubscriptionDto.plan,
          status: BillingStatus.ACTIVE,
          amount: amount / 100, // Convert cents to dollars
          currency: 'USD',
          periodStart: new Date(stripeSubscription.current_period_start * 1000),
          periodEnd: new Date(stripeSubscription.current_period_end * 1000),
        },
      });

      // Log audit event
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'subscription.created',
          resource: 'subscription',
          resourceId: billing.id,
          details: {
            plan: createSubscriptionDto.plan,
            amount,
            stripeSubscriptionId: stripeSubscription.id,
          },
        },
      });

      this.logger.log(`Subscription created for tenant ${tenantId}, plan: ${createSubscriptionDto.plan}`);

      return {
        billing,
        stripeSubscription,
        clientSecret: (stripeSubscription.latest_invoice as Stripe.Invoice)?.payment_intent 
          ? ((stripeSubscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)?.client_secret
          : null,
      };
    } catch (error) {
      this.logger.error('Failed to create subscription', error.stack);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    userId: string,
    tenantId: string,
    subscriptionId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    try {
      // Find existing billing
      const billing = await this.prisma.billing.findFirst({
        where: {
          id: subscriptionId,
          tenantId,
        },
        include: { tenant: true },
      });

      if (!billing) {
        throw new NotFoundException('Subscription not found');
      }

      const stripeCustomerId = billing.tenant.settings?.['stripeCustomerId'] as string;
      const stripeSubscriptionId = billing.tenant.settings?.['stripeSubscriptionId'] as string;

      if (!stripeCustomerId || !stripeSubscriptionId) {
        throw new BadRequestException('No Stripe subscription found');
      }

      // Update Stripe subscription
      const updatedStripeSubscription = await this.stripeService.updateSubscription({
        subscriptionId: stripeSubscriptionId,
        plan: updateSubscriptionDto.plan,
        seats: updateSubscriptionDto.seats,
        paymentMethodId: updateSubscriptionDto.paymentMethodId,
      });

      // Update billing record
      const updateData: any = {};
      
      if (updateSubscriptionDto.plan) {
        updateData.plan = updateSubscriptionDto.plan;
        const seats = updateSubscriptionDto.seats || 1;
        const amount = this.stripeService.getPlanPrice(updateSubscriptionDto.plan, seats);
        updateData.amount = amount / 100;
      }

      const updatedBilling = await this.prisma.billing.update({
        where: { id: subscriptionId },
        data: {
          ...updateData,
          periodEnd: new Date(updatedStripeSubscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
      });

      // Log audit event
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'subscription.updated',
          resource: 'subscription',
          resourceId: subscriptionId,
          details: {
            changes: updateSubscriptionDto,
          },
        },
      });

      this.logger.log(`Subscription ${subscriptionId} updated for tenant ${tenantId}`);

      return {
        billing: updatedBilling,
        stripeSubscription: updatedStripeSubscription,
      };
    } catch (error) {
      this.logger.error('Failed to update subscription', error.stack);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    tenantId: string,
    subscriptionId: string,
    immediately: boolean = false,
  ) {
    try {
      const billing = await this.prisma.billing.findFirst({
        where: {
          id: subscriptionId,
          tenantId,
        },
        include: { tenant: true },
      });

      if (!billing) {
        throw new NotFoundException('Subscription not found');
      }

      const stripeSubscriptionId = billing.tenant.settings?.['stripeSubscriptionId'] as string;

      if (stripeSubscriptionId) {
        await this.stripeService.cancelSubscription(stripeSubscriptionId, immediately);
      }

      // Update billing status
      const updatedBilling = await this.prisma.billing.update({
        where: { id: subscriptionId },
        data: {
          status: BillingStatus.CANCELLED,
          periodEnd: immediately ? new Date() : billing.periodEnd,
        },
      });

      // Log audit event
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'subscription.cancelled',
          resource: 'subscription',
          resourceId: subscriptionId,
          details: {
            immediately,
          },
        },
      });

      this.logger.log(`Subscription ${subscriptionId} cancelled for tenant ${tenantId}`);

      return updatedBilling;
    } catch (error) {
      this.logger.error('Failed to cancel subscription', error.stack);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(userId: string, tenantId: string, subscriptionId: string) {
    const billing = await this.prisma.billing.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
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
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!billing) {
      throw new NotFoundException('Subscription not found');
    }

    return billing;
  }

  /**
   * List subscriptions for tenant
   */
  async listSubscriptions(tenantId: string, status?: BillingStatus) {
    const where: any = { tenantId };
    
    if (status) {
      where.status = status;
    }

    return await this.prisma.billing.findMany({
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
    });
  }

  /**
   * Get current active subscription for tenant
   */
  async getCurrentSubscription(tenantId: string) {
    return await this.prisma.billing.findFirst({
      where: {
        tenantId,
        status: BillingStatus.ACTIVE,
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
  }
}

