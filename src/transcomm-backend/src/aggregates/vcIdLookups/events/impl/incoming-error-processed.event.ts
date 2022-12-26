import { LookupType } from 'core';
import { StorableEvent } from 'event-sourcing';

export class IncomingErrorProcessedEvent extends StorableEvent {
  aggregateEvent = 'vcIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
    public readonly lookupType: LookupType,
  ) {
    super();
  }
}
