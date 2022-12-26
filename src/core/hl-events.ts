import { Address, ConsigneeAddress, Document } from './common';
import {
  Country,
  Currencies,
  CustomsStatus,
  ModeType,
  YesNo,
  DocumentType,
} from './valueEnums';
import {
  SubmitOrderDiscount,
  SubmitOrderExemption,
  SubmitOrderPermit,
  SubmitOrderReturnDetail,
  SubmitOrderSku,
  SubmitOrderVehicle,
} from './submitOrder';

export type InvokeRequest = {
  channelName: string;
  chaincodeName: string;
  methodName: string;
  methodParams: string[];
  isTxnPvt: boolean;
  transientKey: string;
  transientValue: string;
};

export type SubscribeEventRequest = {
  channelName: string;
  chaincodeName: string;
  eventCategory: string;
  eventName: string;
  eventType: string;
  startBlock: number;
  callbackURL: string;
};

export type HighestBlockQuery = {
  highestBlockNumber: number;
};

export type StartingBlockQuery = {
  eventName: string;
  highestBlockNumber: number;
};

export type UnsubscribeEventRequest = {
  id: string;
};

export type AuthenticationRequest = {
  clientID: string;
};

export type HyperledgerResponse = {
  message: {
    response: string;
    txnId: string;
  };
  error: string;
};

export type HyperledgerQueryResponse = {
  message: {
    response: string;
    data: any;
  };
  error: string;
};

export type KafkaMessageSetup = {
  orderNumber: string;
  invoiceNumber: string;
  eventType: string;
  ecomBusinessCode: string;
  authorizationId: string;
  txnId: string;
  data: any;
};

export type AuthHyperledgerResponse = {
  message: {
    response: string;
    token: string;
  };
};

export type StatusResponse = {
  message: string;
};

export type SubscribeResponse = {
  message: {
    subscriptionId: string;
  };
  error: string;
};

export type SubscribeRequestData = {
  eventCategory: string;
  eventName: string;
};

export type SubscriptionCountResponse = {
  message: Subscription[];
  error: string;
};

export type Subscription = {
  eventCategory: string;
  subscriptionIds: string[];
  channelName: string;
  chaincodeName: string;
};

export type EventResponse = {
  txId: string;
  block: string;
  eventName: string;
  chaincodeId: string;
  payload: string;
  privateData: boolean;
  function: string;
  namespace: string;
  collectionName: string;
};

export type ContractHyperledgerEventFromBlockChain = {
  txId: string;
  block: string;
  eventName?: string; //contract event name
  chainCodeId: string;
  payload: string; //json string
  privateData?: boolean;
  function?: string;
  namespace?: string;
  collectionName?: string;
};

export type BlockHyperledgerEventFromBlockChain = {
  txId: string;
  blockNumber: string;
  eventName?: string; //contract event name
  chainCodeId: string;
  payload: string; //json string
  privateData?: boolean;
  function?: string;
  namespace?: string;
  collectionName?: string;
};

export type HyperledgerEventPayload = {
  eventName: string; //invoked event name
  events?: EventPayload[];
  additionalData: string[]; //not clear of data here.
};

export type EventPayload = {
  Key: string;
  Collection: string;
};

export type HyperledgerQuery = {
  key: string;
  collection: string;
};

export type HyperledgerQueryWithTxID = {
  key: string;
  collection: string;
  txId: string;
  eventName: string;
  orderNumber: string;
  invoiceNumber: string;
  ecomCode: string;
};

export type OrderDataKvp = {
  action: string;
  apiName: string;
  attributeName: string;
  attributeSerialNo: number;
  attributeValue: string;
  mode: string;
  timestamp: number;
};

export type OrderData = {
  _id: string;
  key: string;
  current: {
    Key: string;
    actionDate: string;
    actionTimeStamp: number;
    billTo: string;
    billToAddress: Address;
    consigneeAddress: ConsigneeAddress;
    consigneeName: string;
    documentName: string;
    documents: Document[];
    ecomBusinessCode: string;
    errorBusiness: ErrorBusiness[];
    errorCount: number;
    exporterCodeArr: string[];
    hasMultiShipping: YesNo;
    invoiceSummary: string;
    invoices: string[];
    isFaulty: boolean;
    isMarketPlace: boolean;
    kvp: OrderDataKvp[];
    logisticsSPBusinessCodeArr: string[];
    mode: ModeType;
    orderDate: string;
    orderNo: string;
    orderStatus: string;
    referenceID: string;
    shipTo: string;
    shipToAddress: Address;
  };
  documentName: string;
  history: string[];
};

export type ErrorBusiness = {
  apiName: string;
  errorValidation: ErrorValidation[];
  mode: string;
  timestamp: string;
};

export type ErrorValidation = {
  errorCode: string;
  errorDescription: string;
  methodName: string;
  refFields: {
    Path: string;
    dateTime: string;
    format: string;
  };
};

export type ReturnComputations = {
  remainingReturnedQuantity: number;
  returnsemantics: string;
};
export type LineItemsData = {
  _id: string;
  Key: string;
  country: string;
  countryOfOrigin: Country;
  description: string;
  discount: SubmitOrderDiscount;
  documentName: string;
  documents: Document[];
  // duties: string[];
  // dutyPaid: YesNo;
  ecomBusinessCode: string;
  exemptions: SubmitOrderExemption;
  goodsCondition: YesNo;
  hscode: string;
  invoiceNo: string;
  isFreeOfCost: YesNo;
  kvp: string;
  lineNo: number;
  mode: ModeType;
  netWeight: number;
  netWeightUOM: string;
  orderNo: string;
  originalValueOfItem: number;
  permits: SubmitOrderPermit[];
  prevDeclarationReference: string;
  quantity: number;
  quantityReturned: number;
  quantityUOM: string;
  returnComputations: ReturnComputations;
  returnDays: number;
  sku: SubmitOrderSku;
  supplementaryQuantity: number;
  supplementaryQuantityUOM: number;
  valueOfGoods: number;
  vehicle: SubmitOrderVehicle;
};

export type Signature = {
  PODFilePath: string;
  PODHash: string;
};

export type DeliveryStatus = {
  ReturnToFZorCW: string;
  deliverToPersonName: string;
  deliveryDate: string;
  deliveryStatus: string;
  deliveryType: string;
  documents: null;
  kvp: null;
  signature: Signature;
  transportDocNo: string;
  type: string;
};

export type ShippingParameters = {
  claimTrackingHistory: null;
  claimTrackingKey: string;
  declarationDetail: null;
  declarationTrackingKey: string;
  declarationTrackingKeyHistory: null;
  deliveryStatus: DeliveryStatus;
  documentTracking: null;
  isSystemGenerated: true;
  lineItems: null;
  preference: null;
  preferencesKey: string;
  preferencesKeyHistory: null;
  shippingParameterID: string;
  transport: null;
  transportInfoKey: string;
  transportInfoKeyHistory: null;
};

export type InvoiceData = {
  _id: string;
  _rev: string;
  Key: string;
  current: {
    FZCode: string;
    Key: string;
    actionDate: string;
    actionTimeStamp: number;
    associatedEcomCompany: string;
    brokerBusinessCode: string;
    cancellationReason: string;
    cargoOwnership: number;
    currency: Currencies;
    deliveryProviderBusinessCode: string;
    documentName: string;
    documents: Document[];
    ecomBusinessCode: string;
    exitConfirmationDetail: string;
    exitConfirmations: string;
    exporterCode: string;
    freightAmount: number;
    freightCurrency: string;
    hasMultiShipping: boolean;
    incoTerm: string;
    insuranceAmount: number;
    insuranceCurrency: Currencies;
    invoiceDate: string;
    invoiceNumber: string;
    invoiceStatus: string;
    invoiceTrackingKey: string[];
    invoiceTrackingLogs: string;
    invoiceType: number;
    isExited: boolean;
    isUndelivered: boolean;
    kvp: string;
    lineItems: null;
    lineItemsKeys: string[];
    logisticsSPBusinessCode: string;
    mode: ModeType;
    orderNo: string;
    otherShipToAddress: Address;
    paymentInstrumentType: number;
    returnDetail: SubmitOrderReturnDetail;
    returnDetails: null;
    returns: null;
    returnsList: null;
    shippingParameters: ShippingParameters[];
    totalNoOfInvoicePages: number;
    totalValue: number;
    warehouseCode: string;
  };
  documentName: 'string';
  history: string[];
  '~version': string;
};

export type InvoiceTrackingData = {
  _id: string;
  _rev: string;
  Key: string;
  actionByOrgCode: string;
  actionByOrgType: string;
  actionDate: string;
  actionTimeStamp: number;
  declarationNo: string;
  documentName: string;
  ecomBusinessCode: string;
  invoiceNo: string;
  message: string;
  orderNo: string;
  shippingParameterID: string;
  status: string;
  transportDocNo: string;
  '~version': string;
};

export type History = {
  actionBy: string;
  actionTimeStamp: number;
  currentStage: string;
  customsSubmissionResponse: string;
  description: string;
  retryCount: number;
  status: string;
};

export type DocumentTrackingData = {
  BODID: string;
  Key: string;
  actionBy: string;
  authorizedDeclarant: string;
  createdAt: number;
  currentStage: string;
  customsStatus: CustomsStatus;
  customsSubmissionResponse: string;
  declarationType: string;
  declarationNumber: string;
  documentName: string;
  documentNo: string;
  documentType: DocumentType;
  documents: Document[];
  ecomBusinessCode: string;
  errorType: string;
  errors: string;
  funcKey: string;
  history: History[];
  invoiceNo: string;
  isExited: boolean;
  kvp: string;
  lastActivityTimeStamp: number;
  lastStage: string;
  orderNo: string;
  orgType: string;
  platformRequestNumber: string;
  regimeType: string;
  requestID: string;
  responseJSONPayload: string;
  retryCount: 0;
  shippingParameterID: string;
  signature: string;
  transportDocumentNo: string;
  direction: string;
  returnRequestNo: string;
};

export interface ResponseJSONPayload {
  DataArea: ResponseJSONDataArea;
  BODHeader: BODHeader;
  ApplicationArea: ApplicationArea;
}

export interface Bod {
  ResponseDetails: BODResponseDetails;
}

export interface BODResponseDetails {
  BODFailureMessage: null;
  BODWarningMessage: null;
  BODSuccessMessage: BODSuccessMessage;
  DeclarationCharges: DeclarationCharge[];
  Identifier: null;
}

export interface BODSuccessMessage {
  ResponseDetails: BODSuccessMessageResponseDetails;
}

export interface BODSuccessMessageResponseDetails {
  MessageType: null;
  MessageCode: null;
  MessageDescription: null;
  RequestNumber: number;
}

export interface DeclarationCharge {
  ChargeType: number;
  ChargeAmount: number;
}

export type DocumentTrackingError = {
  errorCode: string;
  errorDescription: string;
  errorType: string;
  level: string;
};

export type Sender = {
  AuthorizationID: string;
  ConfirmationCode: string;
  LogicalID: string;
  ReferenceID: string;
  TaskID: string;
};

export type ApplicationArea = {
  BODID: string;
  CreationDateTime: string;
  Sender: Sender;
};

export type BODHeader = {
  LanguageCode: string;
  ReleaseID: string;
  SystemEnvironmentCode: string;
  VersionID: string;
};

export type DeclarationRelatedDocuments = {
  AvailabilityStatus: number;
  DocumentCode: number;
  NonAvailabilityReason: number;
};

export type DeclarationPaymentDetails = {
  PaymentMode: number;
  PaymentReference: string;
};

export type DeclarationTransportPackageDetails = {
  MarksAndNumber: string;
  PackageType: string;
  TotalNumberOfPackages: string;
};

export type DeclarationTransportDocumentDetails = {
  CargoTypePackageCode: string;
  ContainerDetails: string;
  GrossWeightUnit: string;
  NetWeightUnit: string;
  OutboundMasterDocumentNo: string;
  OutboundTransportDocumentNo: string;
  PackageDetails: DeclarationTransportPackageDetails[];
  TotalGrossWeight: number;
  TotalNetWeight: number;
  Volume: number;
  VolumeUnit: string;
};

export type DeclarationDetails = {
  BrokerCustomerCode: number;
  DeclarantReferenceNo: string;
  DeclarationRelatedDocuments: DeclarationRelatedDocuments[];
  DeclarationType: string;
  PaymentDetails: DeclarationPaymentDetails[];
  RegimeType: string;
  TradeType: number;
  TransportDocumentDetails: DeclarationTransportDocumentDetails;
  documents: string;
};

export type ExporterDetails = {
  Phone: string;
};

export type ImporterDetails = {
  Address: string;
  City: string;
  Country: string;
  Name: string;
  Phone: string;
};

export type OutboundCarrierDetails = {
  CarrierNumber: string;
  CarrierRegistrationNo: string;
  DateOfDeparture: string;
  TransportMode: number;
};

export type DeclarationRequestPartiesDetails = {
  BrokerBusinessCode: string;
  CTOCargoHandlerPremisesCode: string;
  CargoOwnership: number;
  ConsignorExporterTransferorCode: string;
  ShippingAirlineAgentBusinessCode: string;
};

export type InvoiceItemsDetail = {
  CommodityCode: string;
  CountryOfOrigin: Country;
  Discount: SubmitOrderDiscount;
  GoodsCondition: YesNo;
  GoodsDescription: string;
  InvoiceItemLineNumber: number;
  IsFreeOfCost: YesNo;
  NetWeight: number;
  NetWeightUnit: string;
  OriginalValueOfItem: number;
  PermitReferenceDetails: SubmitOrderPermit[];
  ReturnDays: number;
  StatisticalQuantity: number;
  StatisticalQuantityMeasurementUnit: string;
  ValueOfGoods: number;
  VehicleDetail: SubmitOrderVehicle;
  VehicleIndicator: YesNo;
};

export type ShippingDetailsInvoice = {
  BuyerName: string;
  INCOTermsCode: string;
  InvoiceCurrency: Currencies;
  InvoiceDate: string;
  InvoiceItemsDetail: InvoiceItemsDetail[];
  InvoiceNumber: string;
  InvoiceType: number;
  InvoiceValue: number;
  PaymentInstrumentType: number;
  SellerName: string;
  TotalNumberOfInvoicePages: number;
};

export type DeclarationRequestShippingDetails = {
  DestinationCountry: string;
  ExitPort: string;
  ExportEntityFreezoneCode: string;
  Invoices: ShippingDetailsInvoice[];
  OriginalLoadPort: string;
  PortOfDischarge: string;
  PortOfLoading: string;
};

export type DeclarationRequest = {
  DeclarationAmendReason: Record<string, string>;
  DeclarationCancellationReason: Record<string, string>;
  DeclarationDetails: DeclarationDetails;
  DocumentName: string;
  ExporterDetails: ExporterDetails;
  ImporterDetails: ImporterDetails;
  InboundCarrierDetails: Record<string, string>;
  Key: string;
  OutboundCarrierDetails: OutboundCarrierDetails;
  PartiesDetails: DeclarationRequestPartiesDetails;
  ShippingDetails: DeclarationRequestShippingDetails;
};

export type MessageHeader = {
  MessageType: string;
};

export type BOD = {
  DeclarationRequest: DeclarationRequest;
  MessageHeader: MessageHeader;
};

export type ResponseJSONDataArea = {
  BOD: Bod;
  Verb: string;
};

export type DataArea = {
  BOD: BOD;
};

export type DeclarationJsonMappingData = {
  ApplicationArea: ApplicationArea;
  BODHeader: BODHeader;
  DataArea: DataArea;
  DocumentName: string;
  Key: string;
};

export type Receiver = {
  AuthorizationID: string;
  ComponentID: string;
  ConfirmationCode: string;
  LogicalID: string;
  ReferenceID: string;
  TaskID: string;
};

export type ClaimRequestSender = {
  AuthorizationID: string;
  ComponentID: string;
  ConfirmationCode: string;
  LogicalID: string;
  ReferenceID: string;
  TaskID: string;
};

export type ClaimRequestApplicationArea = {
  BODID: string;
  CreationDateTime: string;
  Receiver: Receiver;
  Sender: ClaimRequestSender;
  Signature: string;
};

export type ClaimCreationRequest = {
  AccountNumber: string;
  ClaimRegistrationDateTime: string;
  DeclarationNumber: string;
  DepartureDateTime: string;
};

export type ClaimRequestReceive = {
  '-acknowledgeCode': string;
  '-self-closing': string;
};

export type ClaimRequestDataArea = {
  ClaimCreationRequest: ClaimCreationRequest;
  Receive: ClaimRequestReceive;
};

export type ClaimRequestData = {
  ApplicationArea: ClaimRequestApplicationArea;
  BODHeader: BODHeader;
  DataArea: ClaimRequestDataArea;
  DocumentName: string;
  Key: string;
};
