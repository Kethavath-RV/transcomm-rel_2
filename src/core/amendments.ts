import { GoodsCondition, IncoTermCode, UnitOfMeasurement } from './valueEnums';

export interface Amendment {
  ecomBusinessCode: string;
  orderNumber: string;
  invoiceNumber: string;
  incoTerm?: IncoTermCode;
  totalNoOfInvoicePages?: number;
  invoiceDate?: Date | string;
  orderLines: AmendmentOrderLine[];
}

export interface AmendmentOrderLine {
  lineNumber: number;
  commodityCode?: string;
  goodsCondition?: GoodsCondition;
  description?: string;
  quantity?: string;
  quantityUnit?: UnitOfMeasurement;
  weight?: number;
  weightUnit?: UnitOfMeasurement;
  total?: number;
  supplQuantityUnit?: UnitOfMeasurement;
}

export interface AggregateAmendmentData {
  invoiceNumber: string;
  txnIdSubmitOrder: string;
  submitOrderMethodInvokedForAmendment: boolean;
  txnIdUpdateTransportInfo: string;
  updateTransportInfoMethodInvokedForAmendment: boolean;
  initiateDeclarationcallMethodInvokedForAmendment: boolean;
}
