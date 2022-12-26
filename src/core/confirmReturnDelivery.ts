import { Kvp } from './hl-parameters';
import { GoodsCondition, UnitOfMeasurement, YesNo } from './valueEnums';
export interface ConfirmReturnDelivery {
  orderNumber: string;
  ecomBusinessCode: string;
  invoiceNumber: string;
  lineItems: ConfirmReturnLineItem[];
  transportDocNo?: string;
  transportProviderCode?: string;
  returnRequestNo: string;
  gatePasses?: GatePass[];
  dateOfReceivingBackGoods: string;
  kvp: Kvp[];
}

export interface ConfirmReturnLineItem {
  lineNo: number;
  hscode: string;
  skuProductCode?: string;
  receviedQuantity: number; //Misspelled intentionally to be in line with Hyperledger/API docs
  isExtra: YesNo;
  quantityUOM: UnitOfMeasurement;
  goodsCondition?: GoodsCondition;
}

export interface GatePass {
  gatePassNumber: string;
  gatePassDirection: string;
  ActualMovingInDate: string;
}
