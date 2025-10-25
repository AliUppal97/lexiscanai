import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum RevenueType {
  SUBSCRIPTION = 'subscription',
  USAGE = 'usage',
  ADDON = 'addon',
  REFUND = 'refund',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export class TrackRevenueDto {
  @IsString()
  subscriptionId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(RevenueType)
  revenueType: RevenueType;

  @IsString()
  paymentMethod: string;

  @IsBoolean()
  success: boolean;

  @IsString()
  timestamp: string;
}

export class TrackSubscriptionEventDto {
  @IsString()
  subscriptionId: string;

  @IsString()
  eventType: string;

  @IsString()
  planId: string;

  @IsString()
  planName: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @IsString()
  timestamp: string;
}

export class RevenueAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(RevenueType)
  revenueType?: RevenueType;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class SubscriptionAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}

export class FinancialMetricsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  includeForecast?: boolean;

  @IsOptional()
  @IsBoolean()
  includeBreakdown?: boolean;
}
