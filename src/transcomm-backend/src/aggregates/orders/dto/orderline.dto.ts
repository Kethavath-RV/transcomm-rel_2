import { OrderLineView } from 'core';

export class OrderLineDto implements OrderLineView {
  invoiceNumber: string;
  orderNumber: string;
  actionDate: Date | string | null;
  mode: string;
  ecomBusinessCode: string;
  id: string;
  lineNumber: string;
  quantityReturned: number | null;
  quantity: number;
  quantityUOM: string;
  netWeight: number;
  netWeightUOM: string;
  description: string;
  hsCode: string;
  countryOfOrigin: string;
  discountValue: number | null;
  discountPercentage: number | null;
  unitPrice: string;
  originalValueOfItem: number;
  isFreeOfCost: boolean;
  goodsCondition: string;
  supplementaryQuantity: number | null;
  supplementaryQuantityUOM: string;
  prevDeclarationReference: string;
  skuProductCode: string | null;
  skuQuantityUOM: string | null;
  itemLocation: string | null;
  permit: string | null;
  total: number | null;
  returnRequestNumber: string | null;
}
