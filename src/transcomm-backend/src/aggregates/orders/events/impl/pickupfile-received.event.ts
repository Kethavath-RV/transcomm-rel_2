import { CheckPointFile } from 'core';
import { StorableEvent } from 'event-sourcing';

export class PickupFileReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly pickupFileData: CheckPointFile,
  ) {
    super();
  }
}
