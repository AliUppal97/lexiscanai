import { IsString, IsUrl, IsArray, IsOptional } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  headers?: Record<string, string>;
}

