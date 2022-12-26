import { Amendment } from 'core';
import { StorableEvent } from 'event-sourcing';

export class AmendmentCreatedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly ecomBusinessCode: string,
    public readonly invoiceNumber: string,
    public readonly amendment: Amendment,
    public readonly returnRequestNumber: string | null = null,
  ) {
    super();
  }
}
