import { DeliveredView } from 'core';

export class DeliveredDto implements DeliveredView {
  airwayBillNumber: string;
  transportDocumentNumber: string;
  type: string;
  deliveryDate?: Date | null;
  deliveryStatus: string;
  signature: string;
  deliverTo: string;
  deliveryType: string;
  returnTo: string;
  destination: string;
  origin: string;
  documents: string;
  deliveryCode: string
}
