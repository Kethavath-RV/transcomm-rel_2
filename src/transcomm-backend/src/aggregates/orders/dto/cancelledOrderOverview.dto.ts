import { CancelledOrderOverview } from 'core';

export class CancelledOrderOverviewDto implements CancelledOrderOverview {
  ecomCode: string;
  orderNumber: string;
  invoiceNumber: string;
  orderDate: Date | null;
  cancelDate: Date | null;
  lastActionDate: Date | null
  numberOfItems: number;
  cancellationReason: string;
}
