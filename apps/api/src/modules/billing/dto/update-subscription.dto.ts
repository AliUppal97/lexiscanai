import { IsString, IsEnum, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillingPlan } from '@prisma/client';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    description: 'New billing plan',
    enum: BillingPlan,
    example: 'ENTERPRISE',
  })
  @IsOptional()
  @IsEnum(BillingPlan)
  plan?: BillingPlan;

  @ApiPropertyOptional({
    description: 'New payment method ID',
    example: 'pm_0987654321',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Number of seats',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiPropertyOptional({
    description: 'Enable/disable auto-renewal',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

