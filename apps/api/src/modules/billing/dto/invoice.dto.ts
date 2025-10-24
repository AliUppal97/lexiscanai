import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class InvoiceLineItemDto {
  @ApiProperty({ description: 'Description of the line item' })
  description: string;

  @ApiProperty({ description: 'Quantity', example: 1 })
  quantity: number;

  @ApiProperty({ description: 'Unit amount in cents', example: 2999 })
  unitAmount: number;

  @ApiProperty({ description: 'Total amount in cents', example: 2999 })
  amount: number;
}

export class InvoiceDto {
  @ApiProperty({ description: 'Invoice ID', example: 'inv_1234567890' })
  id: string;

  @ApiProperty({ description: 'Invoice number', example: 'INV-2024-001' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Status', example: 'paid' })
  status: string;

  @ApiProperty({ description: 'Amount in cents', example: 2999 })
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Invoice date' })
  invoiceDate: Date;

  @ApiPropertyOptional({ description: 'Due date' })
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Paid date' })
  paidDate?: Date;

  @ApiProperty({ description: 'Line items', type: [InvoiceLineItemDto] })
  lineItems: InvoiceLineItemDto[];

  @ApiPropertyOptional({ description: 'PDF URL' })
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Hosted invoice URL' })
  hostedUrl?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Customer description' })
  description: string;

  @ApiProperty({ description: 'Amount in cents', example: 2999 })
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'USD', default: 'USD' })
  currency: string;

  @ApiPropertyOptional({ description: 'Due date in days', example: 30 })
  dueInDays?: number;

  @ApiProperty({ description: 'Line items', type: [InvoiceLineItemDto] })
  lineItems: InvoiceLineItemDto[];
}

export interface InvoiceQueryParams {
  status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  limit?: number;
  startingAfter?: string;
}

