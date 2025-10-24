import { IsString, IsEnum, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingPlan } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Billing plan',
    enum: BillingPlan,
    example: 'PREMIUM',
  })
  @IsEnum(BillingPlan)
  plan: BillingPlan;

  @ApiProperty({
    description: 'Stripe payment method ID',
    example: 'pm_1234567890',
  })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({
    description: 'Promotional code or coupon',
    example: 'WELCOME20',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Number of users (for enterprise plans)',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiPropertyOptional({
    description: 'Enable auto-renewal',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

