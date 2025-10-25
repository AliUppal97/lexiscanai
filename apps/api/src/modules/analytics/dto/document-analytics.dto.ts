import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EntityDto {
  @IsString()
  type: string;

  @IsString()
  value: string;

  @IsNumber()
  confidence: number;
}

export class SentimentDto {
  @IsNumber()
  score: number;

  @IsNumber()
  magnitude: number;

  @IsString()
  label: string;
}

export class TopicDto {
  @IsString()
  topic: string;

  @IsNumber()
  confidence: number;

  @IsNumber()
  relevance: number;
}

export class KeywordDto {
  @IsString()
  keyword: string;

  @IsNumber()
  frequency: number;

  @IsNumber()
  importance: number;
}

export class ReadabilityDto {
  @IsNumber()
  score: number;

  @IsString()
  level: string;

  @IsNumber()
  grade: number;
}

export class ComplexityDto {
  @IsNumber()
  score: number;

  @IsString()
  level: string;

  @IsArray()
  @IsString({ each: true })
  factors: string[];
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

  @IsNumber()
  accuracy: number;

  @IsNumber()
  confidence: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntityDto)
  entities: EntityDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class TrackContentAnalysisDto {
  @IsString()
  documentId: string;

  @IsString()
  analysisType: string;

  @IsNumber()
  contentLength: number;

  @IsNumber()
  wordCount: number;

  @IsNumber()
  sentenceCount: number;

  @IsNumber()
  paragraphCount: number;

  @IsString()
  language: string;

  @ValidateNested()
  @Type(() => SentimentDto)
  sentiment: SentimentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicDto)
  topics: TopicDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeywordDto)
  keywords: KeywordDto[];

  @ValidateNested()
  @Type(() => ReadabilityDto)
  readability: ReadabilityDto;

  @ValidateNested()
  @Type(() => ComplexityDto)
  complexity: ComplexityDto;
}

export class TrackDocumentLifecycleDto {
  @IsString()
  documentId: string;

  @IsString()
  stage: string;

  @IsString()
  action: string;

  @IsNumber()
  duration: number;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class DocumentProcessingAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  feature?: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @IsOptional()
  @IsNumber()
  minAccuracy?: number;

  @IsOptional()
  @IsNumber()
  maxProcessingTime?: number;
}

export class ContentAnalysisAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  analysisType?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  sentiment?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsNumber()
  minReadabilityScore?: number;

  @IsOptional()
  @IsNumber()
  maxComplexityScore?: number;
}

export class DocumentLifecycleAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean;
}
