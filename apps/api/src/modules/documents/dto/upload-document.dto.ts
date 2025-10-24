import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Document title',
    example: 'Legal Agreement 2024',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Document description',
    example: 'Contract agreement for services',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: 'cln1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'File path in storage',
    example: 's3://bucket/documents/file.pdf',
  })
  filePath: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024567,
  })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Upload status',
    example: 'success',
  })
  status: string;
}

