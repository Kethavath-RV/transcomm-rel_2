import { ReturnOrder } from 'core';
import { StorableEvent } from 'event-sourcing';

export class OrderReturnedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly order: ReturnOrder,
    public readonly vcId: string,
  ) {
    super();
  }
}
