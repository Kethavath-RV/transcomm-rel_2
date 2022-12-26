import { LookupType } from 'core';
import { StorableEvent } from 'event-sourcing';

export class IncomingErrorReceivedEvent extends StorableEvent {
  aggregateEvent = 'vcIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
    public readonly lookupType: LookupType,
    public readonly invoiceNumber?: string,
    public readonly commandName?: string,
    public readonly errorCode?: string,
    public readonly errorMessage?: string,
  ) {
    super();
  }
}
