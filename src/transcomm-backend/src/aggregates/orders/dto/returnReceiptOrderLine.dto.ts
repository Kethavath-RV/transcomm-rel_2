import { ReturnReceiptOrderLineView } from "core";

export class ReturnReceiptOrderLine implements ReturnReceiptOrderLineView {
  id: string;
  lineNumber: number;
  hsCode: string;
  skuProductCode: string;
  receviedQuantity: number; //Misspelled intentionally to be in line with Hyperledger/API docs
  isExtra: string;
  quantityUOM: string;
  goodsCondition: string;
  invoiceNumber: string;
  orderNumber: string;
  ecomBusinessCode: string;
  returnRequestNumber: string;
}