import { CheckPointFile } from 'core';
import { StorableEvent } from 'event-sourcing';

export class DeliveredEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly checkPointData: CheckPointFile
  ) {
    super();
  }
}
