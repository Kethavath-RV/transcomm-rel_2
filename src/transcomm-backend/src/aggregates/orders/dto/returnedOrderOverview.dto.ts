import { ReturnedOrderOverview } from 'core';

export class ReturnedOrderOverviewDto implements ReturnedOrderOverview {
  orderNumber: string;
  ecomCode: string;
  invoiceNumber: string;
  orderDate: Date | null;
  returnDate: Date | null;
  lastActionDate?: Date | null
  numberOfReturnItems: number;
  returnReason: string;
  declarationPurposeDetails: string;
  returnRequestNo: string;
  prevTransportDocNo: string;
  returnJustification: string;
  declarationNumber?: string | null;
  batchId?: string | null;
  declarationStatus?: string | null;
  declarationType?: string | null;
}
