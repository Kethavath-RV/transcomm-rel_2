import { ModeType, ReturnInvoice, ReturnOrder } from 'core';

export class ReturnOrderDatagenParametersDto implements ReturnOrder {
  orderNumber: string;
  actionDate: string;
  ecomBusinessCode: string;
  mode: ModeType;
  invoices: ReturnInvoice[];
}
