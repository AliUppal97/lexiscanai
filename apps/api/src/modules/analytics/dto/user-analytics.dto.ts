import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AdoptionStage {
  DISCOVERY = 'discovery',
  TRIAL = 'trial',
  ADOPTION = 'adoption',
  MASTERY = 'mastery',
}

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

export class TrackUserEngagementDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  pageViews: number;

  @IsNumber()
  timeOnSite: number;

  @IsNumber()
  actions: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsNumber()
  documentsProcessed: number;

  @IsNumber()
  apiCalls: number;

  @IsString()
  lastActivity: string;
}

export class TrackUserBehaviorDto {
  @IsString()
  action: string;

  @IsString()
  context: string;

  @IsNumber()
  duration: number;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo: DeviceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class TrackFeatureAdoptionDto {
  @IsString()
  feature: string;

  @IsString()
  version: string;

  @IsEnum(AdoptionStage)
  adoptionStage: AdoptionStage;

  @IsNumber()
  timeToAdoption: number;

  @IsNumber()
  usageFrequency: number;

  @IsNumber()
  satisfaction: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class TrackUserJourneyDto {
  @IsString()
  journeyId: string;

  @IsString()
  stage: string;

  @IsNumber()
  step: number;

  @IsString()
  action: string;

  @IsNumber()
  duration: number;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  nextStage?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UserEngagementAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  feature?: string;

  @IsOptional()
  @IsString()
  segment?: string;
}

export class UserBehaviorAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class FeatureAdoptionAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  feature?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsEnum(AdoptionStage)
  adoptionStage?: AdoptionStage;

  @IsOptional()
  @IsNumber()
  minSatisfaction?: number;
}

export class UserJourneyAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  journeyId?: string;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  action?: string;
}
