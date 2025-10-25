import { IsString, IsOptional, IsArray, IsObject, IsEnum, IsBoolean, IsNumber, IsDateString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  FAILED = 'failed',
}

export enum WebhookEvent {
  DOCUMENT_PROCESSED = 'document.processed',
  DOCUMENT_FAILED = 'document.failed',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  INVOICE_CREATED = 'invoice.created',
  INVOICE_PAID = 'invoice.paid',
  PAYMENT_FAILED = 'payment.failed',
  TEAM_INVITATION_SENT = 'team.invitation.sent',
  TEAM_INVITATION_ACCEPTED = 'team.invitation.accepted',
  SECURITY_ALERT = 'security.alert',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  CUSTOM = 'custom',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
  EXPIRED = 'expired',
}

export class WebhookHeaderDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  events: WebhookEvent[];

  @IsOptional()
  @IsString()
  secret?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebhookHeaderDto)
  headers?: WebhookHeaderDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  timeout?: number; // seconds

  @IsOptional()
  @IsNumber()
  retryAttempts?: number;

  @IsOptional()
  @IsNumber()
  retryDelay?: number; // seconds

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  events?: WebhookEvent[];

  @IsOptional()
  @IsString()
  secret?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebhookHeaderDto)
  headers?: WebhookHeaderDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  timeout?: number;

  @IsOptional()
  @IsNumber()
  retryAttempts?: number;

  @IsOptional()
  @IsNumber()
  retryDelay?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class WebhookQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @IsOptional()
  @IsEnum(WebhookEvent)
  event?: WebhookEvent;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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

export class WebhookDeliveryDto {
  @IsString()
  id: string;

  @IsString()
  webhookId: string;

  @IsEnum(WebhookEvent)
  event: WebhookEvent;

  @IsObject()
  payload: Record<string, any>;

  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @IsOptional()
  @IsNumber()
  responseCode?: number;

  @IsOptional()
  @IsString()
  responseBody?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsNumber()
  attemptCount: number;

  @IsNumber()
  maxAttempts: number;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @IsOptional()
  @IsDateString()
  nextRetryAt?: string;
}

export class WebhookStatsDto {
  @IsString()
  period: string;

  @IsNumber()
  totalDeliveries: number;

  @IsNumber()
  successfulDeliveries: number;

  @IsNumber()
  failedDeliveries: number;

  @IsNumber()
  successRate: number;

  @IsNumber()
  averageResponseTime: number;

  @IsNumber()
  totalRetries: number;

  @IsObject()
  byEvent: Record<WebhookEvent, number>;

  @IsObject()
  byStatus: Record<DeliveryStatus, number>;
}

export class TestWebhookDto {
  @IsString()
  webhookId: string;

  @IsOptional()
  @IsObject()
  testPayload?: Record<string, any>;

  @IsOptional()
  @IsEnum(WebhookEvent)
  testEvent?: WebhookEvent;
}
