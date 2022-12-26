import { AddressDto } from './address.dto';

export class InvoiceParameterDto {
  shippingParameterId: string;
  shipTo: string;
  shipToAddress: AddressDto;
  deliveryDate: string;
}
