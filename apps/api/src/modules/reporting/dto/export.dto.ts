import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  XML = 'xml',
}

export enum ExportType {
  USERS = 'users',
  DOCUMENTS = 'documents',
  ANALYTICS = 'analytics',
  BILLING = 'billing',
  CUSTOM = 'custom',
}

export class ExportUserDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @IsBoolean()
  includeSensitiveData?: boolean;
}

export class ExportDocumentDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeContent?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}

export class ExportAnalyticsDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsString({ each: true })
  dataTypes: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  granularity: string;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;
}

export class ExportBillingDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsString({ each: true })
  dataTypes: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  includeInvoices?: boolean;

  @IsOptional()
  @IsBoolean()
  includeSubscriptions?: boolean;

  @IsOptional()
  @IsBoolean()
  includePayments?: boolean;
}

export class ExportCustomDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsString()
  dataSource: string;

  @IsString()
  query: string;

  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  customTransformations?: Record<string, any>;
}

export class ExportQueryDto {
  @IsOptional()
  @IsEnum(ExportType)
  exportType?: ExportType;

  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;

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
