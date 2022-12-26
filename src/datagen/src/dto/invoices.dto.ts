import {
  CargoOwnership,
  Currencies,
  FreeZoneCode,
  IncoTermCode,
  Invoice,
  InvoiceType,
  ModeType,
  PaymentInstrumentType,
} from 'core';
import { DocumentDto } from './document.dto';
import { LineItemDto } from './lineItem.dto';
import { ReturnDetailDto } from './returnDetails.dto';

export class InvoiceDto implements Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  mode: ModeType;
  cancellationReason: string;
  totalNoOfInvoicePages: number;
  invoiceType: InvoiceType;
  paymentInstrumentType: PaymentInstrumentType;
  currency: Currencies;
  totalValue: number;
  incoTerm: IncoTermCode;
  freightAmount?: number;
  freightCurrency: Currencies;
  insuranceAmount?: number;
  deliveryProviderBusinessCode?: string;
  insuranceCurrency: Currencies;
  exporterCode: string;
  FZCode: FreeZoneCode;
  warehouseCode: string;
  cargoOwnership: CargoOwnership;
  associatedEcomCompany: string;
  brokerBusinessCode: string;
  logisticsSPBusinessCode: string;
  documents: DocumentDto[];
  returnDetail: ReturnDetailDto;
  lineItems: LineItemDto[];
}
