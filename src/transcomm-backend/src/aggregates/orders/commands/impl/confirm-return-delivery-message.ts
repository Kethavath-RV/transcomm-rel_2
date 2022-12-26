import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ConfirmReturnDelivery } from 'core';

export class ConfirmReturnDeliveryMessageReceivedCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly vcId: string,
    public readonly confirmReturnDelivery: ConfirmReturnDelivery
  ) { }
}
