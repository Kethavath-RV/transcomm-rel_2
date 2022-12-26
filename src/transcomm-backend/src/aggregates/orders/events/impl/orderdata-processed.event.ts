import { OrderData } from 'core';
import { StorableEvent } from 'event-sourcing';

export class OrderDataProcessedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly msgType: string,
    public readonly txnId: string,
    public readonly orderData: OrderData,
  ) {
    super();
  }
}
