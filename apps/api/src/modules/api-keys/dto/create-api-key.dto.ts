import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true})
  scopes?: string[];

  @IsOptional()
  expiresAt?: Date;
}

