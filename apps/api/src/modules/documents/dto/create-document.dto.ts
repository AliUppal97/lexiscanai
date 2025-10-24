import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document title',
    example: 'Contract Agreement 2024',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Document content or description',
    example: 'Legal contract for services...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Document file path (S3/storage URL)',
    example: 's3://bucket/documents/file.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024567,
    required: false,
  })
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: 'Document status',
    enum: DocumentStatus,
    example: DocumentStatus.UPLOADED,
    required: false,
  })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}
