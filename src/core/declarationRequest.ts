import { UnitOfMeasurement } from './valueEnums';

export interface DHLEDeclarationRequest {
  UNB: DHLEUnb;
  UTH: DHLEUth;
  UNH: DHLEUnh;
  Declaration: DHLEDeclaration;
}

export interface DHLEDeclaration {
  BatchHeader: DHLEBatchHeader;
  Consignments: DHLEConsignments;
}

export interface DHLEBatchHeader {
  BrokerBusinessCode: string;
  BrokerCustomerCode: string;
  CTOCargoHandlerPremisesCode: string;
  ShippingAirlineAgentBusinessCode: string;
  PortOfLoading: string;
  PortOfDischarge: string;
  TotalNoOfConsignment: string;
  OutboundMasterDocumentNo?: string; //mawb
  OutboundCarrierDetails?: DHLECarrierDetails;
  InboundMasterDocumentNo?: string;
  InboundCarrierDetails?: DHLECarrierDetails;
}

export interface DHLECarrierDetails {
  TransportMode: string;
  CarrierRegistrationNo: string;
  DateOfDeparture?: string;
  DateOfArrival?: string;
}

export interface DHLEConsignments {
  PartiesDetails: DHLEPartiesDetails;
  DeclarationDetails: DHLEDeclarationDetails;
  ShippingDetails: DHLEShippingDetails;
  DeclarationAmendReason: DHLEDeclarationAmendReason;
  DeclarationCancellationReason: DHLEDeclarationCancellationReason;
  ImporterDetails: DHLEPorterDetails;
  ExporterDetails: DHLEPorterDetails;
}

export interface DHLEDeclarationAmendReason {
  AmendmentReason?: string;
  CargoStatus?: string;
}

export interface DHLEDeclarationCancellationReason {
  CancelReason?: string;
  CargoStatus?: string;
}

export interface DHLEDeclarationDetails {
  DeclarantReferenceNo: string;
  RegimeType: number;
  DeclarationType: number;
  TotalNumberHAWBsConsolidated?: number;
  PaymentDetails: DHLEPaymentDetail[];
  TransportDocumentDetails: DHLETransportDocumentDetail[];
  DeclarationReason?: string;
  GoodsType?: string;
  DeclarationNo?: string;
  BrokerCustomerCode?: string;
  DeclarationPurpose?: string;
  DeclarationRelatedDocuments?: string;
}

export interface DHLEPaymentDetail {
  PaymentMode: number;
  PaymentReference: string;
}

export interface DHLETransportDocumentDetail {
  OutboundMasterDocumentNo?: string;
  OutboundTransportDocumentNo?: string;
  InboundMasterDocumentNo?: string;
  InboundTransportDocumentNo?: string;
  CargoTypePackageCode: string;
  GrossWeightUnit: UnitOfMeasurement;
  TotalGrossWeight: number;
  NetWeightUnit: UnitOfMeasurement;
  TotalNetWeight: number;
  PackageDetails: DHLEPackageDetail[];
  VolumeUnit?: UnitOfMeasurement;
  Volume?: string;
  ContainerDetails?: string;
}

export interface DHLEPackageDetail {
  PackageType: string;
  TotalNumberOfPackages: number;
}

export interface DHLEPorterDetails {
  PersonalIdentificationDocumentType?: string;
  PersonalIdentificationNumber?: string;
  NationalID?: string;
  IssuingAuthorityCountry?: string;
  Name?: string;
  Address?: string;
  Phone?: string;
  Country?: string;
  City?: string;
}

export interface DHLEPartiesDetails {
  ConsignorExporterTransferorCode: string;
  ConsigneeImporterTransfereeCode?: string;
  NotifyPartyCode?: string;
  NotifyPartyName?: string;
  NotifyPartyAddress?: string;
  CTOCargoHandlerPremisesCode?: string;
  ShippingAirlineAgentBusinessCode?: string;
  BrokerBusinessCode?: string;
  MRAAEOIndicator?: string;
}

export interface DHLEShippingDetails {
  DestinationCountry?: string;
  ExitPort?: string;
  Invoices: DHLEInvoice[];
  ExportEntityFreezoneCode?: string;
  ImportEntityFreezoneCode?: string;
  ExportEntityWarehouseCode?: string;
  ImportEntityWarehouseCode?: string;
  PortOfLoading?: string;
  PortOfDischarge?: string;
  OriginalLoadPort?: string;
}

export interface DHLEInvoice {
  InvoiceCurrency: string;
  InvoiceValue: number;
  INCOTermsCode: string;
  InvoiceItemsDetail: DHLEInvoiceItemsDetail[];
  InvoiceNumber?: string;
  InvoiceDate?: string;
  SellerName?: string;
  BuyerName?: string;
  FreightCurrencyCode?: string;
  InsuranceCurrencyCode?: string;
  TotalNumberOfInvoicePages?: number;
  InvoiceType?: number;
  PaymentInstrumentType?: number;
  FreightCharges?: string;
  InsuranceChargesCost?: string;
}

export interface DHLEInvoiceItemsDetail {
  InvoiceItemLineNumber: number;
  CommodityCode: string;
  GoodsDescription: string;
  StatisticalQuantityMeasurementUnit: UnitOfMeasurement;
  NetWeightUnit: UnitOfMeasurement;
  NetWeight: number;
  SupplementaryQuantityMeasurementUnit: UnitOfMeasurement;
  SupplementaryQuantity: number;
  ValueOfGoods: number;
  CountryOfOrigin: string;
  PreviousCustomsDeclarationReferenceNumber: number;
  isRestricted: string;
  PermitRefenceDetails: DHLEPermitRefenceDetail[];
  GoodsCondition?: string;
  VehicleIndicator?: string;
  PreviousCustomsDeclarationInvoiceNumber?: string;
  ExemptionReferenceNumber?: string;
  StatisticalQuantity?: string;
  PreviousCustomsDeclarationInvoiceLineNumber?: string;
  ExemptionType?: string;
  VehicleDetail?: string;
}

export interface DHLEPermitRefenceDetail {
  PermitIndicator: string;
  PermitReferenceNo?: string;
  PermitissuingAuthority?: string;
}

export interface DHLEUnb {
  MessageCode: string;
  MessageVersionNumber: number;
  SenderIdentification: string;
  InterchangeControlReference: string;
  RecipientIdentification: string;
  DateTime: string;
}

export interface DHLEUnh {
  MessageReferenceNumber: string;
  MessageType: string;
}

export interface DHLEUth {
  ReplytoTransportMode: string;
  ReplytoAddress: string;
  ReplytoMessageFormat: string;
}
