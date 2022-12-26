//WIP
import {
  SubmitOrder,
  SubmitOrderInvoice,
  SubmitOrderLineItem,
} from './submitOrder';

export interface OrderBase extends SubmitOrder {
  errorCount: number;
  orderStatus: string; //TODO verify status options
  exporterCodeArr: string[];
  logisticsSPBusinessCodeArr: string[];
  actionTimeStamp: number; //TODO translation (maybe in datagen)
  hasMultiShipping: string; //TODO verify
  isMarketPlace: string; //TODO verify
  otherShipToAddress?: any[]; //TODO verify find example.
  invoiceSummary: string[]; //TODO verify
  errorBusiness: string[]; //TODO verify
  isFaulty: boolean;
}

export interface InvoiceBase extends SubmitOrderInvoice {
  invoiceStatus: string;
  ecomBusinessCode: string; //TODO this is in the order of the submit order
  orderNo: string; //TODO acts like a foreign key
  actionDate: string; //TODO this is on basic order but not on invoice.
  actionTimeStamp: string;
  isExited: boolean;
  isUndelivered: boolean;

  InvoiceTrackingKey: string[];
  InvoiceTrackingLog: string[];

  LineItemKeys: string[];

  shippingParameters: string[];
  hasMultiShipping: boolean;
  // returnDetail: string;
  // returnDetails: string[]; exists something on the api side
  returnsList: string[]; //This could be wrong TODO
  returns: string[];
  exitConfirmations: string[];
  exitConfirmationDetail: string[];
}

export interface LineItemBase extends SubmitOrderLineItem {
  ecomBusinessCode: string; //same as invoice; only on Order in API.
  orderNo: string; //foreign key
  invoiceNo: string; //foreign key
  country: string; //TODO we have countryOfOrigin, but this seems to be different
  returnComputations: string; //TODO check
}

export interface SmartContractOrder extends OrderBase, SmartContractStruct {}

export interface SmartContractStruct {
  //assumption
  documentName: string;
  Key: string;
}
