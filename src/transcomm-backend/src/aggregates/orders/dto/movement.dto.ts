import { MovementView } from 'core';
import { PackageDetailsDto } from './packageDetails.dto';
import { ShippingDetailsDto } from './shippingDetails.dto';

export class MovementDto implements MovementView {
  id: string;
  mode: string;
  type: string;
  mawb: string;
  hawb: string;
  transport: string;
  flightNumber: string;
  portOfLoad: string;
  pointOfExit: string;
  shippingParameterId: string;
  airwayBillNumber: string;
  departureDate: string;
  broker: string;
  agent: string;
  shippingDetails?: ShippingDetailsDto;
  packageDetails?: PackageDetailsDto;
  cargoHandler: string;
  orderId: string;
  referenceId: string | null;
}
