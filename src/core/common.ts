import { Country } from './valueEnums';

export interface Document {
  hash: string;
  path: string;
  name: string;
  //below not on web api doc
}
export interface Address {
  addressLine1: string;
  addressLine2: string;
  POBox: string;
  city: string;
  country: Country;
  //below not on web api doc
}
export interface ConsigneeAddress extends Address {
  phone: string;
  email: string;
  //below not on web api doc
}
