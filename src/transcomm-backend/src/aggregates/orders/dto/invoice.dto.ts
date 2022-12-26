import { InvoicesView } from 'core';
import { OrderLineDto } from './orderline.dto';
import { ReturnReceiptDto } from './returnReceipt.dto';

export class InvoiceDto implements InvoicesView {
  orderNumber: string;
  ecomBusinessCode: string;
  invoiceNumber: string;
  mode: string;
  invoiceDate: Date | null;
  cancellationReason: string | null;
  totalNoOfInvoicePages: number;
  invoiceType: number;
  paymentInstrumentType: number;
  currency: string;
  totalValue: number;
  incoTerm: string;
  freightAmount: number | null;
  freightCurrency: string | null;
  insuranceAmount: number | null;
  insuranceCurrency: string | null;
  exporterCode: string | null;
  fzCode: number | null;
  warehouseCode: string | null;
  cargoOwnership: string | null;
  orderLine: OrderLineDto[];
  returnReceipts: ReturnReceiptDto[];
  lockedBy: string | null;
  locked: boolean;
}
