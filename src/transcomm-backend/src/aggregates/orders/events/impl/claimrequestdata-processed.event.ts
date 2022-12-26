import { StorableEvent } from 'event-sourcing';
import { ClaimRequestData } from 'core';

export class ClaimRequestDataProcessedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly claimRequestData: ClaimRequestData,
  ) {
    super();
  }
}
