import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum MetricType {
  OVERVIEW = 'overview',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  TRENDS = 'trends',
  ALERTS = 'alerts',
}

export enum AlertType {
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class SystemLoadDto {
  @IsNumber()
  cpu: number;

  @IsNumber()
  memory: number;

  @IsNumber()
  disk: number;

  @IsNumber()
  network: number;
}

export class QueueStatusDto {
  @IsNumber()
  pending: number;

  @IsNumber()
  processing: number;

  @IsNumber()
  completed: number;

  @IsNumber()
  failed: number;
}

export class AlertDto {
  @IsEnum(AlertType)
  type: AlertType;

  @IsString()
  message: string;

  @IsString()
  timestamp: string;

  @IsEnum(AlertSeverity)
  severity: AlertSeverity;
}

export class DashboardMetricsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(MetricType)
  metricType?: MetricType;

  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  realTime?: boolean;
}

export class RealTimeMetricsQueryDto {
  @IsOptional()
  @IsBoolean()
  includeSystemLoad?: boolean;

  @IsOptional()
  @IsBoolean()
  includeQueueStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAlerts?: boolean;
}

export class KPIMetricsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  kpiType?: string;

  @IsOptional()
  @IsBoolean()
  includeForecast?: boolean;

  @IsOptional()
  @IsBoolean()
  includeComparison?: boolean;
}

export class DashboardWidgetQueryDto {
  @IsArray()
  @IsString({ each: true })
  widgetIds: string[];

  @IsOptional()
  @IsBoolean()
  includeData?: boolean;

  @IsOptional()
  @IsBoolean()
  includeConfig?: boolean;
}

export class CreateDashboardWidgetDto {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateDashboardWidgetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
