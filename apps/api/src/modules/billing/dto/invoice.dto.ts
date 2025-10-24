import { IsDate, IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class InvoiceDto {
  @ApiProperty({
    description: 'Invoice ID',
    example: 'inv_1234567890',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Billing ID',
    example: 'bill_1234567890',
  })
  @IsString()
  billingId: string;

  @ApiProperty({
    description: 'Invoice amount in cents',
    example: 2999,
  })
  @IsInt()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.PAID,
  })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @ApiProperty({
    description: 'Stripe invoice ID',
    example: 'in_1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  stripeInvoiceId?: string;

  @ApiProperty({
    description: 'Invoice PDF URL',
    example: 'https://invoice.stripe.com/i/acct_.../test_...',
    required: false,
  })
  @IsString()
  @IsOptional()
  invoiceUrl?: string;

  @ApiProperty({
    description: 'Invoice created date',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Invoice due date',
    example: '2024-02-15T10:30:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;
}

export class QueryInvoicesDto {
  @ApiProperty({
    description: 'Filter by invoice status',
    enum: InvoiceStatus,
    required: false,
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
