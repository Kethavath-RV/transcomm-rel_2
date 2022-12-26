import { SubmitOrder } from 'core';
import { StorableEvent } from 'event-sourcing';

export class OrderUpdatedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly order: SubmitOrder,
  ) {
    super();
  }
}
