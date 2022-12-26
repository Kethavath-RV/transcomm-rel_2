import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CancelOrder } from 'core';

export class CancelOrderCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly cancelOrder: CancelOrder,
  ) {}
}
