import { DetailMovement } from 'core';
import { StorableEvent } from 'event-sourcing';

export class IncomingDetailMovementFileEvent extends StorableEvent {
  aggregateEvent = 'mawbToAirwayIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly movementFileDetail: DetailMovement,
  ) {
    super();
  }
}
