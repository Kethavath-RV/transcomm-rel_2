import { ShippingDetailsView } from 'core';

export class ShippingDetailsDto implements ShippingDetailsView {
  modeOfTransport: string;
  carrierNumber: string;
  dateOfArrival: string;
  dateOfDeparture: string;
  portOfLoad: string;
  portOfDischarge: string;
  originalLoadPort: string;
  destinationCountry: string;
  pointOfExit: string;
  LDMBusinessCode: string;
}
