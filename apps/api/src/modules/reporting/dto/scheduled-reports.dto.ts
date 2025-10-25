import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ReportStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  FAILED = 'failed',
}

export enum ExecutionStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class RecipientDto {
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class ScheduleDto {
  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @IsOptional()
  @IsNumber()
  dayOfWeek?: number;

  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  @IsString()
  time: string;

  @IsString()
  timezone: string;
}

export class CreateScheduledReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  reportType: string;

  @IsString()
  format: string;

  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;

  @IsOptional()
  @IsNumber()
  retentionDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateScheduledReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule?: ScheduleDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients?: RecipientDto[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;

  @IsOptional()
  @IsNumber()
  retentionDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ScheduledReportQueryDto {
  @IsOptional()
  @IsString()
  reportType?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ReportExecutionQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
