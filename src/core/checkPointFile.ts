/*
called checkpoint file because it is used for:
undelivered
pickup
delivered
different values required for different cases, but come from the same source.
*/
export interface CheckPointFile {
  eventCode?: string;
  eventRemark?: string;
  ecomBusinessCode: string;
  weight?: number;
  volumeWeight?: number;
  weightQualifier?: string;
  numberOfPackages?: number;
  shipperReference: string;
  hawb: string;
  ETADateTime?: string;
  eventDate?: string; //e.g. 2021-09-01 18:07:22
  eventGMT?: string; //e.g. -07:00
  destination?: string;
  origin?: string;
  shipmentDeclaredValue?: string;
  shipmentCurrency?: string;
}
