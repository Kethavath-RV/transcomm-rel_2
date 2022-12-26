import { DetailMovement } from 'core';

export class PerformDetailToOrderIdLookupCommand {
  constructor(
    public readonly airwayBillNumber: string,
    public readonly movementDetailData: DetailMovement,
  ) {}
}
