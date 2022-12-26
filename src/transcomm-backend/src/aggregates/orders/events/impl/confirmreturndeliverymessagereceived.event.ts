import { ConfirmReturnDelivery } from 'core';
import { StorableEvent } from 'event-sourcing';

export class ConfirmReturnDeliveryMessageReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly orderNumber: string,
    public readonly ecomCode: string,
    public readonly vcId: string,
    public readonly confirmReturnDelivery: ConfirmReturnDelivery
  ) {
    super();
  }
}
