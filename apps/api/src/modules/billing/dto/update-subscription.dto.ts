import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingPlan, BillingStatus } from '@prisma/client';

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Update billing plan',
    enum: BillingPlan,
    example: BillingPlan.PREMIUM,
    required: false,
  })
  @IsEnum(BillingPlan)
  @IsOptional()
  plan?: BillingPlan;

  @ApiProperty({
    description: 'Update billing status',
    enum: BillingStatus,
    example: BillingStatus.ACTIVE,
    required: false,
  })
  @IsEnum(BillingStatus)
  @IsOptional()
  status?: BillingStatus;

  @ApiProperty({
    description: 'Update payment method ID',
    example: 'pm_0987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
