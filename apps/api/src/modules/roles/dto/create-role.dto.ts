import { IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsString()
  color?: string; // For UI display

  @IsOptional()
  priority?: number; // Role hierarchy
}

