import { StorableEvent } from 'event-sourcing';
import { InvoiceData } from 'core';

export class InvoiceDataProcessedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly invoiceId: string,
    public readonly invoiceData: InvoiceData,
  ) {
    super();
  }
}
