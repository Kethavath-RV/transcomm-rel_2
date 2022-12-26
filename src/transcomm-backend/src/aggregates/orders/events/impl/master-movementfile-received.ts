import { MasterMovement } from 'core';
import { StorableEvent } from 'event-sourcing';

export class MasterMovementFileReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly masterMovementFile: MasterMovement,
    public readonly hawb: string
  ) {
    super();
  }
}
