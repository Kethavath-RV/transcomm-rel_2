import { Type } from 'class-transformer';
import { IsInt, IsDate, IsOptional } from 'class-validator';
import { Amendment, IncoTermCode } from 'core';
import { AmendmentOrderLineDto } from './amendmentOrderLine.dto';

export class AmendmentRequestDto implements Amendment {
  ecomBusinessCode: string;
  orderNumber: string;
  invoiceNumber: string;
  @IsOptional()
  incoTerm?: IncoTermCode;
  @IsOptional()
  @IsInt()
  totalNoOfInvoicePages?: number;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  invoiceDate?: Date;
  orderLines: AmendmentOrderLineDto[];
}
