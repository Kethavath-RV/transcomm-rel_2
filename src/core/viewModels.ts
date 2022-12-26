import { OrderStatus, UserRole } from './viewEnums';

type PrismaDate = Date | string | null;

export type OrderView = {
  orderNumber: string;
  orderDate: Date | null;
  lastActionDate: Date | null;
  ecomBusinessCode: string | null;
  status: string;
  addresses: AddressView[];
  eventChain: ChainEventView[];
  invoices: InvoicesView[];
  houseBills: HouseBillView[];
  movements: MovementView[];
  declarations: DeclarationView[];
  delivered: DeliveredView[];
};

export interface AddressView {
  addressLine1: string | null;
  addressLine2: string | null;
  POBox: string | null;
  city: string;
  country: string;
  name: string;
  type: string;
}

export interface ChainEventView {
  eventType: string;
  eventTime: Date;
  exceptions: ChainExceptionView[];
}

export interface ChainExceptionView {
  exceptionCode: string;
  exceptionDetail: string;
}

export interface OrderLineView {
  id: string;
  lineNumber: string;
  mode: string;
  quantityReturned: number | null;
  quantity: number;
  quantityUOM: string;
  netWeight: number;
  netWeightUOM: string;
  description: string;
  hsCode: string;
  countryOfOrigin: string;
  discountValue: number | null;
  discountPercentage: number | null;
  unitPrice: string;
  originalValueOfItem: number;
  isFreeOfCost: boolean;
  goodsCondition: string;
  supplementaryQuantity: number | null;
  supplementaryQuantityUOM: string;
  prevDeclarationReference: string;
  skuProductCode: string | null;
  skuQuantityUOM: string | null;
  itemLocation: string | null;
  permit: string | null;
  total: number | null;
  returnRequestNumber: string | null;
  invoiceNumber: string;
  orderNumber: string;
  ecomBusinessCode: string | null;
  actionDate: PrismaDate;
}

export interface InvoicesView {
  invoiceNumber: string;
  mode: string;
  invoiceDate: Date | null;
  cancellationReason: string | null;
  totalNoOfInvoicePages: number;
  invoiceType: number;
  paymentInstrumentType: number;
  currency: string;
  totalValue: number;
  incoTerm: string;
  freightAmount: number | null;
  freightCurrency: string | null;
  insuranceAmount: number | null;
  insuranceCurrency: string | null;
  exporterCode: string | null;
  fzCode: number | null;
  warehouseCode: string | null;
  cargoOwnership: string | null;
  orderNumber: string;
  ecomBusinessCode: string;
  orderLine: OrderLineView[];
  returnReceipts: ReturnReceiptView[];
  lockedBy: string | null;
  locked: boolean;
}

export interface ReturnReceiptView {
  orderNumber: string;
  ecomBusinessCode: string;
  invoiceNumber: string;
  returnRequestNumber: string;
  transportDocNo: string;
  transportProviderCode: string;
  dateOfReceivingBackGoods: string;
  gatePassNumber: string;
  actualMovingInDate: string;
  lineItems: ReturnReceiptOrderLineView[];
}

export interface ReturnReceiptOrderLineView {
  id: string;
  lineNumber: number;
  hsCode: string;
  skuProductCode: string | null;
  receviedQuantity: number; //Misspelled intentionally to be in line with Hyperledger/API docs
  isExtra: string;
  quantityUOM: string;
  goodsCondition: string;
  invoiceNumber: string;
  orderNumber: string;
  ecomBusinessCode: string;
  returnRequestNumber: string;
}

export interface HouseBillView {
  airwayBillNumber: string | null;
  numberOfPackages: number | null;
  weightAndQualifier: string | null;
  volumeAndQualifier: string | null;
  declaredValue: string | null;
  eventDate: PrismaDate;
}

export interface MovementView {
  id: string;
  mode: string;
  type: string;
  mawb: string;
  hawb: string;
  transport: string;
  shippingParameterId: string;
  airwayBillNumber: string;
  flightNumber: string;
  portOfLoad: string;
  pointOfExit: string;
  departureDate: string;
  broker: string;
  agent: string;
  cargoHandler: string;
  shippingDetails?: ShippingDetailsView;
  packageDetails?: PackageDetailsView;
  orderId: string;
  referenceId: string | null;
}

export interface ShippingDetailsView {
  modeOfTransport: string;
  carrierNumber: string;
  dateOfArrival: string;
  dateOfDeparture: string;
  portOfLoad: string;
  portOfDischarge: string;
  originalLoadPort: string;
  destinationCountry: string;
  pointOfExit: string;
  LDMBusinessCode: string;
}

export interface PackageDetailsView {
  packageType: string;
  numberOfPackages: number;
  containerNumber: string;
  cargoType: string;
  netWeightAndUnit: string;
  containerSize: string;
  containerType: string;
  containerSealNumber: string;
  grossWeightAndUnit: string;
  volumetricWeightAndUnit: string;
}

export interface DeclarationView {
  declarationType: string | null;
  declarationNumber: string | null;
  batchId: string | null;
  clearanceStatus: string;
  version: string | null;
  invoiceNumber: string;
  shipmentMode: string | null;
  regimeType: string | null;
  exportCodeMirsalTwo: string | null;
  recipientIdentification: string | null;
  senderIdentification: string | null;
  numberOfPages: number | null;
  errorType: string | null;
  direction: string | null;
  returnRequestNo: string | null;
  createdAt: string | null;
  bodId: string | null;
  chargeAmount: string | null;
  chargeType: string | null;
  errors: DeclarationErrorView[];
  claim?: ClaimView;
}

export interface DeclarationErrorView {
  id: string;
  errorCode: string;
  errorDescription: string;
  errorType: string;
  level: string;
  orderId: string;
  ecomBusinessCode: string;
}

export interface ClaimView {
  ecomBusinessCode: string;
  orderNumber: string;
  invoiceNumber: string;
  requestDate: Date;
  currentStage: string;
  claimStatus: string;
  declarationNumber: string;
  claimNumber: string;
  claimType: string;
  transportDocumentNumber: string;
}

export interface DeliveredView {
  airwayBillNumber: string;
  transportDocumentNumber: string;
  type: string;
  deliveryDate?: Date | string | null;
  deliveryStatus: string;
  signature: string;
  deliverTo: string;
  deliveryType: string;
  returnTo: string;
  origin: string;
  destination: string;
  documents: string; // not sure what value
  deliveryCode: string;
}

export interface ExceptionOverview {
  orderNumber: string;
  invoiceNumber: string;
  orderDate?: Date | null;
  lastActionDate?: Date | null;
  ecomCode: string;
  locked: boolean;
  lockedBy?: string;
  batchId: string;
  declarationStatus: string;
  declarationReference: string;
  rejectionDate?: Date | null;
  flightNumber: string; //airway no?
  transport: string;
  mawb: string;
}

export type OrderOverview = {
  orderNumber: string;
  invoiceNumber: string;
  ecomCode: string;
  orderDate?: Date | null;
  lastActionDate?: Date | null;
  orderStatus: OrderStatus;
  declarationType: string;
  claimNumber?: string | null;
  claimRequestDate?: Date | null;
  claimStatus?: string | null;
  claimType?: string | null;
  declarationStatus: string;
  numberOfItems: number;
  declarationNumber?: string | null;
  batchId?: string | null;
  transport: string;
};

export interface CancelledOrderOverview {
  ecomCode: string;
  orderNumber: string;
  invoiceNumber: string;
  orderDate?: Date | null;
  lastActionDate?: Date | null;
  cancelDate?: Date | null;
  numberOfItems: number;
  cancellationReason: string;
}

export interface ReturnedOrderOverview {
  orderNumber: string;
  ecomCode: string;
  invoiceNumber: string;
  orderDate?: Date | null;
  returnDate?: Date | null;
  lastActionDate?: Date | null;
  numberOfReturnItems: number;
  returnReason: string;
  declarationPurposeDetails: string;
  returnRequestNo: string;
  prevTransportDocNo: string;
  returnJustification: string;
  declarationNumber?: string | null;
  batchId?: string | null;
  declarationStatus?: string | null;
  declarationType?: string | null;
}

export interface RefreshDto {
  message?: string;
  expires?: Date;
  refreshFailed?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  locked: boolean;
}

export interface Paginated<t> {
  data: t[];
  numberOfRecords: number;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserEditRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserEditPasswordRequest {
  id: string;
  password: string;
}

export interface ManualRetryView {
  orderNumber: string;
  invoiceNumber: string;
  ecomCode: string;
  contractType?: string;
  errorCode?: string;
  errorDesc?: string;
  failDate?: Date;
  status?: string;
  retryButton?: boolean;
  contractMethod: string;
  remark: string | null;
}

export interface ManualRetryRequest {
  data: ManualRetryView[];
}
