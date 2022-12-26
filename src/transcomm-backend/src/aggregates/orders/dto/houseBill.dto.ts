import { HouseBillView } from 'core';

export class HouseBillDto implements HouseBillView {
  eventDate: string | Date | null;
  airwayBillNumber: string | null;
  numberOfPackages: number | null;
  weightAndQualifier: string | null;
  volumeAndQualifier: string | null;
  declaredValue: string | null;
}
