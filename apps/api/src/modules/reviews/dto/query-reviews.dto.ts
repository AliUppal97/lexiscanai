import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReviewStatus } from '@prisma/client';

export class QueryReviewsDto {
  @ApiProperty({
    description: 'Filter by review status',
    enum: ReviewStatus,
    required: false,
  })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @ApiProperty({
    description: 'Filter by document ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  documentId?: string;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export * from './create-review.dto';
export * from './update-review.dto';

