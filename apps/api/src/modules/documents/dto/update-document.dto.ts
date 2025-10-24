import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Update document title',
    example: 'Updated Contract Agreement 2024',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Update document content',
    example: 'Updated legal contract content...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Update document status',
    enum: DocumentStatus,
    example: DocumentStatus.PROCESSED,
    required: false,
  })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}

