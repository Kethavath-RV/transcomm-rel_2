import { CheckPointFile } from 'core';
import { StorableEvent } from 'event-sourcing';

export class UndeliveredEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly checkPointData: CheckPointFile
  ) {
    super();
  }
}
