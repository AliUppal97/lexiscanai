import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional, IsObject, Min, Max, IsArray } from 'class-validator';

export class CreateFeatureFlagDto {
  @ApiProperty({ description: 'Feature flag key (unique identifier)' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Feature flag name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Feature flag description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is flag enabled', default: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Rollout percentage (0-100)', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rolloutPercentage?: number;

  @ApiPropertyOptional({ description: 'Targeting rules (JSON)' })
  @IsObject()
  @IsOptional()
  targetingRules?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Feature flag dependencies (JSON)' })
  @IsObject()
  @IsOptional()
  dependencies?: Record<string, any>;
}

export class UpdateFeatureFlagDto {
  @ApiPropertyOptional({ description: 'Feature flag name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Feature flag description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is flag enabled' })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Rollout percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rolloutPercentage?: number;

  @ApiPropertyOptional({ description: 'Targeting rules (JSON)' })
  @IsObject()
  @IsOptional()
  targetingRules?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Feature flag dependencies (JSON)' })
  @IsObject()
  @IsOptional()
  dependencies?: Record<string, any>;
}

export class EvaluateFeatureFlagDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Evaluation context (JSON)' })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}

export class CreateABTestDto {
  @ApiProperty({ description: 'A/B test name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'A/B test description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Feature flag keys (array)', type: [String] })
  @IsArray()
  @IsString({ each: true })
  flagKeys: string[];

  @ApiProperty({ description: 'Variants configuration (JSON)' })
  @IsObject()
  variants: Record<string, any>;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Success metrics (JSON)' })
  @IsObject()
  @IsOptional()
  successMetrics?: Record<string, any>;
}

