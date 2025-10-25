import { IsString, IsOptional, IsArray, IsObject, IsEnum, IsBoolean, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationType {
  DOCUMENT_PROCESSED = 'document_processed',
  DOCUMENT_FAILED = 'document_failed',
  REVIEW_COMPLETED = 'review_completed',
  INVOICE_GENERATED = 'invoice_generated',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  TEAM_INVITATION = 'team_invitation',
  SYSTEM_ALERT = 'system_alert',
  SECURITY_ALERT = 'security_alert',
  BILLING_ALERT = 'billing_alert',
  FEATURE_UPDATE = 'feature_update',
  MAINTENANCE_NOTICE = 'maintenance_notice',
  CUSTOM = 'custom',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class NotificationRecipientDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  deviceToken?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class CreateNotificationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationRecipientDto)
  recipients: NotificationRecipientDto[];

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  actionText?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  expiresIn?: number; // seconds

  @IsOptional()
  @IsBoolean()
  persistent?: boolean;

  @IsOptional()
  @IsBoolean()
  silent?: boolean;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  actionText?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  expiresIn?: number;

  @IsOptional()
  @IsBoolean()
  persistent?: boolean;

  @IsOptional()
  @IsBoolean()
  silent?: boolean;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

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

export class NotificationPreferencesDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  webhookEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  enabledTypes?: NotificationType[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  disabledTypes?: NotificationType[];

  @IsOptional()
  @IsString()
  quietHoursStart?: string; // HH:mm format

  @IsOptional()
  @IsString()
  quietHoursEnd?: string; // HH:mm format

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quietDays?: string[]; // ['monday', 'tuesday', etc.]
}

export class NotificationStatsDto {
  @IsString()
  period: string;

  @IsNumber()
  totalSent: number;

  @IsNumber()
  totalDelivered: number;

  @IsNumber()
  totalRead: number;

  @IsNumber()
  totalFailed: number;

  @IsNumber()
  deliveryRate: number;

  @IsNumber()
  readRate: number;

  @IsNumber()
  failureRate: number;

  @IsObject()
  byChannel: Record<NotificationChannel, number>;

  @IsObject()
  byType: Record<NotificationType, number>;
}
