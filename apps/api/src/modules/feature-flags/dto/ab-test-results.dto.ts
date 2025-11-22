import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class ABTestResultsDto {
  @ApiProperty({ description: 'Experiment ID' })
  @IsString()
  experimentId: string;

  @ApiProperty({ description: 'Experiment status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Variant performance data' })
  variants: VariantPerformanceDto[];

  @ApiProperty({ description: 'Statistical significance results' })
  significance: SignificanceResultDto;

  @ApiProperty({ description: 'Sample size requirements' })
  sampleSize: SampleSizeResultDto;

  @ApiProperty({ description: 'Recommendations' })
  recommendations: string[];
}

export class VariantPerformanceDto {
  @ApiProperty({ description: 'Variant name' })
  variant: string;

  @ApiProperty({ description: 'Conversion metrics' })
  metrics: ConversionMetricsDto;

  @ApiProperty({ description: 'Lift compared to control', required: false })
  @IsOptional()
  @IsNumber()
  lift?: number;

  @ApiProperty({ description: 'Lift confidence interval', required: false })
  @IsOptional()
  liftConfidenceInterval?: [number, number];
}

export class ConversionMetricsDto {
  @ApiProperty({ description: 'Number of conversions' })
  conversions: number;

  @ApiProperty({ description: 'Number of visitors' })
  visitors: number;

  @ApiProperty({ description: 'Conversion rate (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  conversionRate: number;

  @ApiProperty({ description: '95% confidence interval' })
  confidenceInterval: [number, number];

  @ApiProperty({ description: 'Standard error' })
  standardError: number;
}

export class SignificanceResultDto {
  @ApiProperty({ description: 'P-value' })
  @IsNumber()
  @Min(0)
  @Max(1)
  pValue: number;

  @ApiProperty({ description: 'Is statistically significant' })
  isSignificant: boolean;

  @ApiProperty({ description: 'Confidence interval' })
  confidenceInterval: [number, number];

  @ApiProperty({ description: 'Effect size' })
  @IsNumber()
  effectSize: number;

  @ApiProperty({ description: 'Statistical method used' })
  method: 'chi-square' | 't-test' | 'bayesian';
}

export class SampleSizeResultDto {
  @ApiProperty({ description: 'Required sample size per variant' })
  @IsNumber()
  requiredSampleSize: number;

  @ApiProperty({ description: 'Required sample size per variant' })
  @IsNumber()
  requiredSampleSizePerVariant: number;

  @ApiProperty({ description: 'Total required sample size' })
  @IsNumber()
  totalRequiredSampleSize: number;

  @ApiProperty({ description: 'Estimated duration in days' })
  @IsNumber()
  estimatedDuration: number;

  @ApiProperty({ description: 'Statistical power' })
  @IsNumber()
  @Min(0)
  @Max(1)
  power: number;

  @ApiProperty({ description: 'Minimum detectable effect' })
  @IsNumber()
  mde: number;
}

export class TrackEventDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Event type (e.g., conversion, click)' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Event value (optional)', required: false })
  @IsOptional()
  @IsNumber()
  eventValue?: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: any;
}

export class CalculateSampleSizeDto {
  @ApiProperty({ description: 'Minimum detectable effect (as decimal, e.g., 0.05 for 5%)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  mde?: number;

  @ApiProperty({ description: 'Statistical power (default 0.8)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  power?: number;

  @ApiProperty({ description: 'Significance level (default 0.05)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  alpha?: number;
}

