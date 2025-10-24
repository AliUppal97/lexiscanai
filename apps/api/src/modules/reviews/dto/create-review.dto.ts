import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Document ID to review',
    example: 'cln1234567890',
  })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({
    description: 'Review status',
    enum: ReviewStatus,
    example: ReviewStatus.PENDING,
    required: false,
  })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @ApiProperty({
    description: 'Review score (1-100)',
    example: 85,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  score?: number;

  @ApiProperty({
    description: 'Review feedback or comments',
    example: 'Document is well-structured and complete',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}

