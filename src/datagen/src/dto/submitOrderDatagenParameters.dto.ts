import { Document, ModeType, SubmitOrder, SubmitOrderInvoice } from 'core';
import { AddressDto, ConsigneeAddressDto } from './address.dto';
import { KvpDto } from './kvp.dto';

export class SubmitOrderDatagenParametersDto implements SubmitOrder {
  orderNumber: string;
  referenceId?: string;
  orderDate: string;
  actionDate: string;
  ecomBusinessCode: string;
  eCommBusinessName?: string;
  mode: ModeType;
  consigneeName?: string;
  consigneeAddress?: ConsigneeAddressDto;
  billTo?: string;
  billToAddress?: AddressDto;
  shipTo?: string;
  shipToAddress?: AddressDto;
  documents?: Document[];
  invoices: SubmitOrderInvoice[];
  __kvp?: KvpDto[]; //An array of key-value pairs - Flexible Attribute due to multiple stakeholders are involved.
}
