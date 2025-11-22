import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsBoolean, IsOptional, Min, IsInt } from 'class-validator';
import { ResourceType, QuotaPeriod, QuotaAlertType } from '@prisma/client';

export class CreateQuotaConfigDto {
  @ApiProperty({ enum: ResourceType, description: 'Resource type for quota' })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({ description: 'Quota limit', example: 1000 })
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiProperty({ enum: QuotaPeriod, description: 'Quota period', default: QuotaPeriod.MONTHLY })
  @IsEnum(QuotaPeriod)
  @IsOptional()
  period?: QuotaPeriod;

  @ApiPropertyOptional({ description: 'Next reset date' })
  @IsOptional()
  resetDate?: Date;

  @ApiPropertyOptional({ description: 'Allow overage', default: false })
  @IsBoolean()
  @IsOptional()
  overageAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Maximum overage limit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overageLimit?: number;
}

export class UpdateQuotaConfigDto {
  @ApiPropertyOptional({ description: 'Quota limit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: QuotaPeriod })
  @IsEnum(QuotaPeriod)
  @IsOptional()
  period?: QuotaPeriod;

  @ApiPropertyOptional({ description: 'Next reset date' })
  @IsOptional()
  resetDate?: Date;

  @ApiPropertyOptional({ description: 'Allow overage' })
  @IsBoolean()
  @IsOptional()
  overageAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Maximum overage limit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overageLimit?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QuotaUsageDto {
  @ApiProperty({ description: 'Current usage' })
  currentUsage: bigint;

  @ApiProperty({ description: 'Quota limit' })
  limit: bigint;

  @ApiProperty({ description: 'Usage percentage' })
  usagePercentage: number;

  @ApiProperty({ description: 'Remaining quota' })
  remaining: bigint;

  @ApiProperty({ description: 'Is quota exceeded' })
  isExceeded: boolean;

  @ApiProperty({ description: 'Is quota warning threshold reached' })
  isWarning: boolean;

  @ApiProperty({ description: 'Resource type' })
  resourceType: ResourceType;

  @ApiProperty({ description: 'Period' })
  period: QuotaPeriod;

  @ApiPropertyOptional({ description: 'Next reset date' })
  resetDate?: Date;
}

export class UsageStatsDto {
  @ApiProperty({ description: 'Total usage' })
  totalUsage: bigint;

  @ApiProperty({ description: 'Usage count' })
  count: number;

  @ApiProperty({ description: 'Average usage per record' })
  averageUsage: number;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  endDate: Date;
}

export class QuotaAlertDto {
  @ApiProperty({ description: 'Alert ID' })
  id: string;

  @ApiProperty({ enum: QuotaAlertType })
  alertType: QuotaAlertType;

  @ApiProperty({ description: 'Threshold percentage' })
  thresholdPercentage: number;

  @ApiProperty({ description: 'Sent at' })
  sentAt: Date;

  @ApiPropertyOptional({ description: 'Acknowledged at' })
  acknowledgedAt?: Date;

  @ApiPropertyOptional({ description: 'Message' })
  message?: string;
}

