import { ModeType, OrderForTransportInfo } from 'core';
import { AddressDto, ConsigneeAddressDto } from './address.dto';
import { DocumentDto } from './document.dto';
import { TransportInvoiceDto } from './transportInvoice.dto';

export class OrderForTransportInfoDto implements OrderForTransportInfo {
  orderNumber: string;
  orderDate: string;
  actionDate: string;
  ecomBusinessCode: string;
  mode: ModeType;
  consigneeName?: string;
  consigneeAddress?: ConsigneeAddressDto;
  billTo: string;
  billToAddress: AddressDto;
  shipTo?: string;
  shipToAddress?: AddressDto;
  documents: DocumentDto[];
  invoices: TransportInvoiceDto[];
}
