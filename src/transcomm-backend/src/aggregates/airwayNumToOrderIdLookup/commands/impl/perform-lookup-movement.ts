import { MasterMovement } from 'core';

export class PerformAirwayBillNoToOrderIdLookupMovementCommand {
  constructor(
    public readonly airwayBillNumber: string,
    public readonly movementFileData: MasterMovement,
  ) {}
}
