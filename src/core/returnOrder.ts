import { Exemption, ReturnDetail } from './order';
import { ModeType } from './valueEnums';

export interface ReturnOrder {
  orderNumber: string;
  actionDate: string;
  ecomBusinessCode: string;
  mode: ModeType;
  invoices: ReturnInvoice[];
}

export interface ReturnInvoice {
  invoiceNumber: string;
  mode: ModeType;
  exporterCode: string;
  returnDetail: ReturnDetail;
  lineItems: ReturnLineItem[];
}

export interface ReturnLineItem {
  lineNo: number;
  mode: ModeType;
  quantityReturned: number;
  hscode?: string;
  exemptions?: Exemption[];
}
