import { ShippingDetails } from 'core';

export class ShippingDetailsDTo implements ShippingDetails {
  shippingAgentBusinessCode: string;
  modeOfTransport: string;
  carrierNumber: string;
  carrierRegistrationNo: string;
  dateOfDeparture: string;
  dateOfArrival: string;
  portOfLoad: string;
  portOfDischarge: string;
  originalLoadPort: string;
  destinationCountry: string;
  pointOfExit: string;
  cargoHandlerCode: string;
  LMDBusinessCode: string;
}
