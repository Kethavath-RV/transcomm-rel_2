import { DetailMovement } from 'core';

export class PerformMawbAirwayNumsLookupCommand {
  constructor(
    public readonly mawb: string,
    public readonly movementFileData: DetailMovement,
  ) {}
}
