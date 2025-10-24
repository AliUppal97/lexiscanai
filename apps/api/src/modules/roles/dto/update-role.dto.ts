import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

