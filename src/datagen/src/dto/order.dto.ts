import { ModeType, Order } from 'core';
import { AddressDto, ConsigneeAddressDto } from './address.dto';
import { DocumentDto } from './document.dto';
import { InvoiceDto } from './invoices.dto';

export class OrderDto implements Order {
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
  invoices: InvoiceDto[];
}
