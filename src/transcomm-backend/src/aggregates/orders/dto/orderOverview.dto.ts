import { OrderOverview, OrderStatus } from 'core';

export class OrderOverviewDto implements OrderOverview {
  orderNumber: string;
  invoiceNumber: string;
  ecomCode: string;
  orderDate?: Date | null;
  lastActionDate?: Date | null
  orderStatus: OrderStatus;
  declarationStatus: string;
  numberOfItems: number;
  transport: string;
  declarationType: string;
  claimNumber?: string | null;
  claimRequestDate?: Date | null;
  claimStatus?: string | null;
  claimType?: string | null;
  declarationNumber?: string | null;
  batchId?: string | null;
}
