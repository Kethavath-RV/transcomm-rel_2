import { ApiProperty } from '@nestjs/swagger';
import { ExceptionOverview } from 'core';

export class ExceptionOverviewDto implements ExceptionOverview {
  orderNumber: string;
  invoiceNumber: string;
  @ApiProperty({
    type: Date,
  })
  orderDate?: Date | null;
  lastActionDate?: Date | null
  ecomCode: string;
  locked: boolean;
  lockedBy?: string;
  batchId: string;
  declarationStatus: string;
  declarationReference: string;
  rejectionDate?: Date | null;
  flightNumber: string;
  transport: string;
  mawb: string;
}
