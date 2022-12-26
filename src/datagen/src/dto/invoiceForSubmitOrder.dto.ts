import {
  CargoOwnership,
  Currencies,
  FreeZoneCode,
  IncoTermCode,
  ModeType,
  InvoiceForSubmitOrder,
} from 'core';
import { DocumentDto } from './document.dto';
import { LineItemForSubmitOrderDto } from './lineItemForSubmitOrder.dto';
import { ReturnDetailDto } from './returnDetails.dto';

export class InvoiceForSubmitOrderDto implements InvoiceForSubmitOrder {
  invoiceNumber: string;
  invoiceDate: string;
  mode: ModeType;
  cancellationReason: string;
  totalNoOfInvoicePages: number;
  invoiceType: string;
  paymentInstrumentType: string;
  currency: Currencies;
  totalValue: number;
  incoTerm: IncoTermCode;
  freightAmount?: number;
  freightCurrency: Currencies;
  insuranceAmount?: number;
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
  lineItems: LineItemForSubmitOrderDto[];
}
