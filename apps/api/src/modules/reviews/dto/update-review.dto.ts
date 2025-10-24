import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class UpdateReviewDto {
  @ApiProperty({
    description: 'Update review status',
    enum: ReviewStatus,
    required: false,
  })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @ApiProperty({
    description: 'Update review score',
    example: 90,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  score?: number;

  @ApiProperty({
    description: 'Update feedback',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}

