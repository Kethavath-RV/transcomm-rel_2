import { Address, ConsigneeAddress, Country } from 'core';

export class AddressDto implements Address {
  addressLine1: string;
  addressLine2: string;
  POBox: string;
  city: string;
  country: Country;
}

export class ConsigneeAddressDto implements ConsigneeAddress {
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  POBox: string;
  city: string;
  country: Country;
}
