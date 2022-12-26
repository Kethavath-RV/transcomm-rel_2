import { LookupType } from 'core';
import { StorableEvent } from 'event-sourcing';

export class NotificationProcessedReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
    public readonly lookupType: LookupType,
    public readonly vcId: string,
    public readonly invoiceNumber?: string,
  ) {
    super();
  }
}
