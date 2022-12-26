import { ModeType, OrderForSubmitOrder } from 'core';
import { AddressDto, ConsigneeAddressDto } from './address.dto';
import { DocumentDto } from './document.dto';
import { InvoiceForSubmitOrderDto } from './invoiceForSubmitOrder.dto';

export class OrderForSubmitOrderDto implements OrderForSubmitOrder {
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
  invoices: InvoiceForSubmitOrderDto[];
}
