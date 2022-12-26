import { TransportInvoice } from 'core';

export class TransportInvoiceDto implements TransportInvoice {
  invoiceNumber: string;
  shippingParameterID: string;
}
