import { AddressView } from 'core';

export class AddressDto implements AddressView {
  type: string;
  addressLine1: string | null;
  addressLine2: string | null;
  POBox: string | null;
  city: string;
  country: string;
  name: string;
}
