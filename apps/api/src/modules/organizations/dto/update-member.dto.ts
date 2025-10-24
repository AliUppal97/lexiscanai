import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

