import { TransportDocumentDetails, UnitOfMeasurement } from 'core';

export class TransportDocumentDetailsDto implements TransportDocumentDetails {
  masterTransportDocNo: string;
  transportDocNo: string;
  cargoType: string;
  grossWeight: number;
  grossWeightUOM: UnitOfMeasurement;
  netWeight: number;
  netWeightUOM: UnitOfMeasurement;
}
