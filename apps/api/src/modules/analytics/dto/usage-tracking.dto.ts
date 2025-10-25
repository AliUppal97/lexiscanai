import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeviceInfoDto {
  @IsString()
  userAgent: string;

  @IsString()
  platform: string;

  @IsString()
  browser: string;

  @IsString()
  version: string;
}

export class LocationDto {
  @IsString()
  country: string;

  @IsString()
  region: string;

  @IsString()
  city: string;

  @IsString()
  timezone: string;
}

export class TrackUserSessionDto {
  @IsString()
  sessionId: string;

  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsNumber()
  pageViews: number;

  @IsNumber()
  actions: number;

  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo: DeviceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class TrackFeatureUsageDto {
  @IsString()
  feature: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class TrackAPIUsageDto {
  @IsString()
  endpoint: string;

  @IsString()
  method: string;

  @IsNumber()
  statusCode: number;

  @IsNumber()
  responseTime: number;

  @IsNumber()
  requestSize: number;

  @IsNumber()
  responseSize: number;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class TrackDocumentProcessingDto {
  @IsString()
  documentId: string;

  @IsString()
  documentType: string;

  @IsNumber()
  fileSize: number;

  @IsNumber()
  processingTime: number;

  @IsNumber()
  aiProcessingTime: number;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];
}
