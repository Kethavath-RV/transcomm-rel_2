import { CheckPointFile } from 'core';
import { StorableEvent } from 'event-sourcing';

export class DfCheckpointFileReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly checkpointFileData: CheckPointFile,
  ) {
    super();
  }
}
