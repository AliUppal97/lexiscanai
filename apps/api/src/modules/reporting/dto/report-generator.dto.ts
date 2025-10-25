import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportType {
  USER_ANALYTICS = 'user_analytics',
  DOCUMENT_ANALYTICS = 'document_analytics',
  BILLING_ANALYTICS = 'billing_analytics',
  PERFORMANCE_ANALYTICS = 'performance_analytics',
  REVENUE = 'revenue',
  EXPENSES = 'expenses',
  PROFIT_LOSS = 'profit_loss',
  CASH_FLOW = 'cash_flow',
  BUDGET_VARIANCE = 'budget_variance',
  SYSTEM_PERFORMANCE = 'system_performance',
  USER_ACTIVITY = 'user_activity',
  DOCUMENT_PROCESSING = 'document_processing',
  API_USAGE = 'api_usage',
  ERROR_ANALYSIS = 'error_analysis',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export class GenerateAnalyticsReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class GenerateFinancialReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;

  @IsString()
  currency: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class GenerateOperationalReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class GenerateCustomReportDto {
  @IsString()
  reportType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;

  @IsString()
  template: string;

  @IsArray()
  @IsString({ each: true })
  dataSources: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class ReportQueryDto {
  @IsOptional()
  @IsString()
  reportType?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

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
