import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  size?: string; // '1-10', '11-50', '51-200', '201-500', '500+'

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  settings?: {
    theme?: string;
    language?: string;
    timezone?: string;
    features?: string[];
  };
}

