import { DetailMovement } from 'core';
import { StorableEvent } from 'event-sourcing';

export class DetailMovementReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly detailMovementFile: DetailMovement,
  ) {
    super();
  }
}
