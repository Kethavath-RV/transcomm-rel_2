import { CancelOrder } from 'core';
import { StorableEvent } from 'event-sourcing';

export class OrderCancelledEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly cancelOrder: CancelOrder,
  ) {
    super();
  }
}
