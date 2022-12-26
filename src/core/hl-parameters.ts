import { Address, ConsigneeAddress, Document } from './common';
import { ConfirmReturnLineItem, GatePass } from './confirmReturnDelivery';
import { Order, ReturnDetail } from './order';
import { ReturnLineItem } from './returnOrder';
import {
  SubmitOrderDiscount,
  SubmitOrderDuty,
  SubmitOrderExemption,
  SubmitOrderPermit,
  SubmitOrderReturnDetail,
  SubmitOrderSku,
  SubmitOrderVehicle,
} from './submitOrder';
import {
  CargoOwnership,
  Country,
  Currencies,
  FreeZoneCode,
  GoodsCondition,
  IncoTermCode,
  ModeType,
  UnitOfMeasurement,
  YesNo,
} from './valueEnums';

export type SubmitOrderParameters = {
  orderNumber: string;
  orderDate: string;
  actionDate: string;
  ecomBusinessCode: string;
  mode: string;
  billTo: string;
  shipTo: string;
  consigneeAddress: ConsigneeAddress;
  billToAddress: Address;
  shipToAddress: Address;
  documents: Document[];
  invoices: InvoiceForSubmitOrder[];
  referenceID?: string;
  uuid: string;
  consigneeName: string;
  consigneeCode: string;
  jwt: string;
  eCommBusinessName: string;
  kvps: Kvp[];
  uuid20: string;
  epochTimeStamp: string;
  signature: string;
  stringifiedPayload: OrderForSubmitOrder;
  orgCode: string;
};

export interface OrderForSubmitOrder {
  orderNumber: string;
  referenceId?: string;
  orderDate?: string;
  actionDate: string;
  ecomBusinessCode: string;
  eCommBusinessName?: string;
  mode: ModeType;
  consigneeName?: string;
  consigneeAddress?: ConsigneeAddress;
  billTo?: string;
  billToAddress?: Address;
  shipTo?: string;
  shipToAddress?: Address;
  documents?: Document[];
  invoices: InvoiceForSubmitOrder[];
  __kvp?: Kvp[]; //An array of key-value pairs - Flexible Attribute due to multiple stakeholders are involved.
}

export interface InvoiceForSubmitOrder {
  invoiceNumber: string;
  invoiceDate: string;
  mode: ModeType;
  otherShipToAddress?: Address;
  cancellationReason?: string;
  totalNoOfInvoicePages?: number;
  invoiceType: string;
  paymentInstrumentType: string;
  currency: Currencies;
  incoTerm: IncoTermCode;
  freightAmount?: number; //Decimal(16,3)
  freightCurrency: Currencies;
  insuranceAmount?: number; //Decimal(16,3)
  insuranceCurrency: Currencies;
  exporterCode?: string;
  FZCode: FreeZoneCode;
  warehouseCode?: string;
  cargoOwnership?: CargoOwnership;
  associatedEcomCompany?: string;
  brokerBusinessCode?: string; //Fixed values "DHL"
  logisticsSPBusinessCode?: string; //Fixed values "DHL"
  deliveryProviderBusinessCode?: string;
  documents?: Document[];
  returnDetail?: SubmitOrderReturnDetail;
  lineItems: LineItemForSubmitOrder[];
}

export interface LineItemForSubmitOrder {
  lineNo: number;
  mode: ModeType;
  quantityReturned: number;
  quantity: number;
  quantityUOM: UnitOfMeasurement;
  netWeight: number;
  netWeightUOM: UnitOfMeasurement;
  description?: string;
  hscode: string;
  countryOfOrigin: Country;
  discount: SubmitOrderDiscount;
  valueOfGoods: number; //(16,3) decimal
  originalValueOfItem?: number; //(18,3) decimal
  isFreeOfCost: YesNo;
  goodsCondition: GoodsCondition;
  // dutyPaid: YesNo;
  // duties: SubmitOrderDuty[];
  supplementaryQuantity?: number; //(15,4) decimal
  supplementaryQuantityUOM: UnitOfMeasurement;
  prevDeclarationReference?: string; //big int per docs
  permits?: SubmitOrderPermit[];
  exemptions?: SubmitOrderExemption[];
  documents?: Document[]; //Note max three
  vehicle: SubmitOrderVehicle;
  sku: SubmitOrderSku;
}

export type SubmitOrderParametersForReturn = {
  orderNumber: string;
  actionDate: string;
  mode: string;
  invoices: InvoiceForSubmitOrderParametersForReturn[];
};

export interface InvoiceForSubmitOrderParametersForReturn {
  invoiceNumber: string;
  mode: ModeType;
  exporterCode: string;
  returnDetail: ReturnDetail;
  lineItems: ReturnLineItem[];
}

export type UpdateTransportInfoParameters = {
  orderNumber: string;
  shippingParameterId: string;
  ecomOrgCode: string;
  invoices: TransportInvoice[];
  direction: string;
  returnRequestNo: string;
  oldHouseTransportDocNo: string;
  mode: string;
  autoInitiateDeclaration: YesNo;
  shippingDetail: ShippingDetails;
  transportDocumentDetails: TransportDocumentDetails;
  packageDetails: PackageDetails[];
  documents: Document[];
  uuid: string;
  transportProviderCode: string;
  jwt: string;
  uuid20: string;
  referenceID: string;
  kvp: Kvp[];
  epochTimeStamp: string;
  signature: string;
  stringifiedPayload: OrderForTransportInfo;
  orgCode: string;
};

export interface OrderForTransportInfo {
  orderNumber: string;
  referenceId?: string;
  orderDate?: string;
  actionDate: string;
  ecomBusinessCode: string;
  eCommBusinessName?: string;
  mode: ModeType;
  consigneeName?: string;
  consigneeAddress?: ConsigneeAddress;
  billTo?: string;
  billToAddress?: Address;
  shipTo?: string;
  shipToAddress?: Address;
  documents?: Document[];
  invoices: TransportInvoice[];
  __kvp?: Kvp[];
}

export type TransportInvoice = {
  invoiceNumber: string;
};

export type ShippingDetails = {
  shippingAgentBusinessCode: string;
  modeOfTransport: string;
  carrierNumber: string;
  carrierRegistrationNo: string;
  dateOfDeparture?: string;
  dateOfArrival?: string;
  portOfLoad: string;
  portOfDischarge: string;
  originalLoadPort: string;
  destinationCountry: string;
  pointOfExit?: string;
  cargoHandlerCode: string;
  LMDBusinessCode: string;
};

export type TransportDocumentDetails = {
  masterTransportDocNo: string;
  transportDocNo: string;
  cargoType: string;
  grossWeight: number;
  grossWeightUOM: UnitOfMeasurement;
  netWeight: number;
  netWeightUOM: UnitOfMeasurement;
};

export type PackageDetails = {
  packageType: string;
  numberOfPackages: number;
  container: string[];
};

export type InitiateDeclarationParameters = {
  uuid: string;
  orderNumber: string;
  ecomOrgCode: string;
  invoiceNumber: string;
  shippingParameterID: string;
  direction: string;
  returnRequestNo: string;
  paymentDetails: PaymentDetail[];
  tradeType: string;
  declarationType: number;
  brokerCustomerCode: number;
  prevDeclarationReference: string;
  prevDeclarationInvoiceNo: string;
  prevDeclarationItemLineNo: string;
  declarationDocuments: DeclarationDocument[];
  invoiceItemLineNo: number;
  declarantReferenceNo: string;
  kvp: Kvp[];
  jwt: string;
  uuid20: string;
  epochTimeStamp: string;
  signature: string;
  stringifiedPayload: Order;
  orgCode: string;
};

export type PaymentDetail = {
  paymentMode: string;
  declarationChargesAccount: string;
};

export type DeclarationDocument = {
  documentCode: string;
  availabilityStatus: string;
  nonAvailabilityReason: string;
  isDepositCollected: string;
};

export type Kvp = {
  attributeSerialNo: number;
  attributeName: string;
  attributeValue: string;
};

export type DeliverOrderParameters = {
  orderNumber: string;
  invoiceNumber: string;
  transportDocNo: string;
  direction: string;
  deliveryDate: string;
  deliverToPersonName: string;
  deliveryStatus: string;
  deliveryType: string;
  ecomOrgCode: string;
  jwt: string;
  signature: DeliverySignature;
  returnToFZorCW: string;
  documents: Document[];
  signaturePODFilePath: string;
  signaturePODHash: string;
  transportProviderCode: string;
  epochTimeStamp: string;
  footerSignature: string;
  stringifiedPayload: DeliverOrderStringified;
  orgCode: string;
};

export type DeliverySignature = {
  PODFilePath: string;
  PODHash: string;
};

export type DeliverOrderStringified = {
  orderNumber: string;
  invoiceNumber: string;
  ecomOrgCode: string;
  transportDocNo: string;
  transportProviderCode: string;
  referenceID: string;
  direction: string;
  deliveryDate: string;
  deliverToPersonName: string;
  deliveryStatus: string;
  deliveryType: string;
};

export type UpdateExitConfirmationParameters = {
  uuid: string;
  referenceID: string;
  transportDocNo: string;
  transportProviderCode: string;
  exitData: ExitData[];
  kvp?: Kvp[];
  jwt: string;
  uuid16: string;
  epochTimeStamp: string;
  signature: string;
  stringifiedPayload: Order;
  orgCode: string;
};

export type ExitData = {
  declarationNo: string;
  actualDepartureDate: string;
  carrierNumber: string;
  pointOfExit: string;
  debitCreditAccountNo: string;
};

export type ConfirmReturnDeliveryParameters = {
  orderNumber: string;
  invoiceNumber: string;
  transportDocNo: string;
  returnRequestNo: string;
  gatePasses: GatePass[];
  dateOfReceivingBackGoods: string;
  lineItems: ConfirmReturnLineItem[];
  ecomOrgCode: string;
  uuid: string;
  jwt: string;
  uuid20: string;
  kvp: Kvp[];
  transportProviderCode: string;
  epochTimeStamp: string;
  signature: string;
  stringifiedPayload: Order;
  orgCode: string;
};
