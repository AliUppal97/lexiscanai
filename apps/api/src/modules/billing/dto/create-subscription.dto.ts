import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingPlan } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Billing plan to subscribe to',
    enum: BillingPlan,
    example: BillingPlan.BASIC,
  })
  @IsEnum(BillingPlan)
  @IsNotEmpty()
  plan: BillingPlan;

  @ApiProperty({
    description: 'Stripe payment method ID',
    example: 'pm_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @ApiProperty({
    description: 'User ID to create subscription for',
    example: 'cln1234567890',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Billing period in months',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  billingPeriodMonths?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Coupon or promotion code',
    example: 'SUMMER2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  couponCode?: string;
}
