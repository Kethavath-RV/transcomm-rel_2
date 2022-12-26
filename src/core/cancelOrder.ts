import { ModeType } from './valueEnums';

export interface CancelOrder {
  orderNumber: string;
  actionDate: string;
  ecomBusinessCode: string;
  mode: ModeType;
  invoices: CancelInvoice[];
}

export interface CancelInvoice {
  invoiceNumber: string;
  cancellationReason: string;
}
