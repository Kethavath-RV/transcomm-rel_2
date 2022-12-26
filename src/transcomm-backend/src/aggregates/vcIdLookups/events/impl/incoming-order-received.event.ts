import { LookupType } from 'core';
import { StorableEvent } from 'event-sourcing';

export class IncomingOrderReceivedEvent extends StorableEvent {
  aggregateEvent = 'vcIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
    public readonly lookupType: LookupType,
    public readonly invoiceNumber?: string,
  ) {
    super();
  }
}
