import { CheckPointFile } from './checkPointFile';
import { Address, ConsigneeAddress, Document } from './common';
import { ConfirmReturnDelivery } from './confirmReturnDelivery';
import { DHLEDeclarationRequest } from './declarationRequest';
import { Kvp } from './hl-parameters';
import { DetailMovement, MasterMovement, Movement } from './movements';
import { ReturnOrder } from './returnOrder';
import {
  CargoOwnership,
  Country,
  Currencies,
  ExemptionType,
  FreeZoneCode,
  GoodsCondition,
  IncoTermCode,
  InvoiceType,
  ModeType,
  PaymentInstrumentType,
  PermitIssuingAuthorityCode,
  ReturnReason,
  UnitOfMeasurement,
  VehicleBrand,
  VehicleCondition,
  VehicleDrive,
  VehicleType,
  YesNo,
} from './valueEnums';

export interface Order {
  orderNumber: string;
  referenceId?: string;
  orderDate: string;
  actionDate: string;
  ecomBusinessCode: string;
  eCommBusinessName?: string;
  mode: ModeType;
  consigneeName?: string;
  consigneeAddress?: ConsigneeAddress; //TODO Consignee Address has more fields than others? only?
  billTo?: string;
  billToAddress?: Address;
  shipTo?: string;
  shipToAddress?: Address;
  documents?: Document[];
  invoices: Invoice[];
  __kvp?: Kvp[]; //An array of key-value pairs - Flexible Attribute due to multiple stakeholders are involved.
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  mode: ModeType;
  otherShipToAddress?: Address;
  cancellationReason?: string;
  totalNoOfInvoicePages?: number;
  invoiceType: InvoiceType;
  paymentInstrumentType: PaymentInstrumentType;
  currency: Currencies;
  totalValue?: number; // Decimal(16,3)
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
  returnDetail?: ReturnDetail;
  lineItems: LineItem[];
  //below not on web api doc
  lockedBy?: string;
  locked?: boolean;
  declarations?: Declaration[];
}

export interface LineItem {
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
  discount: Discount;
  valueOfGoods: number; //(16,3) decimal
  originalValueOfItem?: number; //(18,3) decimal
  isFreeOfCost: YesNo;
  goodsCondition: GoodsCondition;
  // dutyPaid: YesNo;
  // duties: Duty[];
  supplementaryQuantity?: number; //(15,4) decimal
  supplementaryQuantityUOM: UnitOfMeasurement;
  prevDeclarationReference?: string; //big int per docs
  permits?: Permit[];
  sku: Sku;
  exemptions?: Exemption[];
  documents?: Document[]; //Note max three
  vehicle: Vehicle;
  //below not on web api doc
}

export interface Duty {
  dutyType?: string;
  dutyValue?: number; //Decimal(18,3)
}
export interface ReturnDetail {
  //TODO verify also name?
  returnRequestNo: string;
  prevTransportDocNo?: string;
  returnReason?: ReturnReason;
  declarationPurposeDetails?: string;
  returnTransportDocNo?: string;
  returnJustification?: string;
  //below not on web api doc
}

export interface Exemption {
  exemptionType: ExemptionType;
  exemptionRefNo?: string;
  //below not on web api doc
}

export interface Discount {
  value?: number; //TODO check
  percentage?: number;
  //below not on web api doc
}

export interface Permit {
  //TODO verify
  referenceNo?: string;
  issuingAuthorityCode: PermitIssuingAuthorityCode;
  notRequiredFlag: YesNo;
  //below not on web api doc
}

export interface Sku {
  productCode?: string;
  quantityUOM?: string;
  unitPrice?: number;
  //below not on web api doc
}

export interface Vehicle {
  //TODO verify
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
  //below not on web api doc
}

export interface Declaration {
  declarationType: string;
  declarationNumber: string;
  brokerCode: string;
  exporterCode: string;
  batchId: string;
  clearanceStatus: string;
  version: string;
  shipmentMode: string;
  regimeType: string;
  senderIdentification: string;
  numberOfPages: number;
  claim?: Claim;
  claimRequest?: ClaimRequest;
  direction: string | null;
  returnRequestNo: string | null;
  createdAt: string | null;
  bodId: string | null;
  chargeAmount: string | null;
  chargeType: string | null;
  errorType: string;
  errors: string;
  hlKey: string;
}

export interface ClaimRequest {
  accountNumber: string;
  receiver: PartyReceiver;
  sender: PartySender;
}

export interface Claim {
  ecomBusinessCode: string;
  orderNumber: string;
  invoiceNumber: string;
  requestDate: string;
  currentStage: string;
  claimStatus: string;
  declarationNumber: string;
  nrClaimNumber: string;
  claimType: string;
  hlKey: string;
  transportDocumentNumber: string;
}

export interface PartyReceiver {
  AuthorizationID: string;
  ComponentID: string;
  ConfirmationCode: string;
  LogicalID: string;
  ReferenceID: string;
  TaskID: string;
}

export interface PartySender {
  AuthorizationID: string;
  ComponentID: string;
  ConfirmationCode: string;
  LogicalID: string;
  ReferenceID: string;
  TaskID: string;
}

export interface ReturnRequest {
  request: ReturnOrder;
  vcId: string;
  actionDate: string | Date;
  returns: Return[];
  pickupFile?: CheckPointFile;
  movementData?: Movement;
  masterMovement?: MasterMovement;
  detailMovement?: DetailMovement;
  declarationRequest?: DHLEDeclarationRequest;
  processed: boolean;
  submitted: boolean;
  updatedShipping: boolean;
  delivered: boolean;
  deliveredTime?: string;
  deliveredDate?: string;
}

export interface Return {
  invoiceNumber: string;
  returnRequestNo: string;
  exporterCode: string;
  lineItems: ReturnRequestLineItem[];
  prevTransportDocNo?: string;
  returnReason?: ReturnReason;
  declarationPurposeDetails?: string;
  returnTransportDocNo?: string;
  returnJustification?: string;
  confirmReturn?: ConfirmReturnDelivery;
}

export interface ReturnRequestLineItem {
  lineNo: number;
  mode: ModeType;
  quantityReturned: number;
  hscode?: string;
  exemptions?: Exemption[];
  actionDate: string;
}
