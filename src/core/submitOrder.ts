import {
  ModeType,
  Country,
  Currencies,
  FreeZoneCode,
  GoodsCondition,
  IncoTermCode,
  InvoiceType,
  PaymentInstrumentType,
  UnitOfMeasurement,
  VehicleBrand,
  VehicleCondition,
  VehicleType,
  PermitIssuingAuthorityCode,
  ExemptionType,
  VehicleDrive,
  YesNo,
  ReturnReason,
  CargoOwnership,
} from './valueEnums';
import { Address, Document, ConsigneeAddress } from './common';
import { Kvp } from './hl-parameters';

export interface SubmitOrder {
  orderNumber: string;
  referenceId?: string;
  orderDate: string;
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
  invoices: SubmitOrderInvoice[];
  __kvp?: Kvp[]; //An array of key-value pairs - Flexible Attribute due to multiple stakeholders are involved.
}

export interface SubmitOrderInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  mode: ModeType;
  otherShipToAddress?: Address;
  cancellationReason?: string;
  totalNoOfInvoicePages?: number;
  invoiceType: InvoiceType;
  paymentInstrumentType: PaymentInstrumentType;
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
  brokerBusinessCode?: string;
  logisticsSPBusinessCode?: string;
  deliveryProviderBusinessCode?: string;
  documents?: Document[];
  returnDetail?: SubmitOrderReturnDetail;
  lineItems: SubmitOrderLineItem[];
}

export interface SubmitOrderLineItem {
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
  sku: SubmitOrderSku;
  exemptions?: SubmitOrderExemption[];
  documents?: Document[]; //Note max three
  vehicle: SubmitOrderVehicle;
}

export interface SubmitOrderReturnDetail {
  returnRequestNo: string;
  prevTransportDocNo?: string;
  returnReason?: ReturnReason;
  declarationPurposeDetails?: string;
  returnJustification?: string;
}

export interface SubmitOrderExemption {
  exemptionType: ExemptionType;
  exemptionRefNo?: string;
}

export interface SubmitOrderDiscount {
  value?: number;
  percentage?: number;
}

export interface SubmitOrderPermit {
  referenceNo?: string;
  issuingAuthorityCode: PermitIssuingAuthorityCode;
  notRequiredFlag: YesNo;
}

export interface SubmitOrderSku {
  productCode?: string;
  quantityUOM?: string;
  unitPrice?: number;
}

export interface SubmitOrderDuty {
  dutyType?: string;
  dutyValue?: number; //Decimal(18,3)
}

export interface SubmitOrderVehicle {
  chassisNumber?: string;
  brand: VehicleBrand;
  model?: string;
  engineNumber?: string;
  capacity?: number; //decimal (6,2)
  passengerCapacity?: number;
  carriageCapacity?: number;
  yearOfBuilt?: string;
  color?: string;
  condition: VehicleCondition;
  vehicleType: VehicleType;
  drive: VehicleDrive;
  specificationStandard?: string;
}
