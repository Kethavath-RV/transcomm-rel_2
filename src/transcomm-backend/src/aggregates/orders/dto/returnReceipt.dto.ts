import { ReturnReceiptView } from "core";
import { ReturnReceiptOrderLine } from "./returnReceiptOrderLine.dto";

export class ReturnReceiptDto implements ReturnReceiptView {
  orderNumber: string;
  ecomBusinessCode: string;
  invoiceNumber: string;
  returnRequestNumber: string;
  transportDocNo: string;
  transportProviderCode: string;
  dateOfReceivingBackGoods: string;
  gatePassNumber: string;
  actualMovingInDate: string;
  lineItems: ReturnReceiptOrderLine[];
}