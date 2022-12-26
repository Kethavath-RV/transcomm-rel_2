import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ReturnOrder } from 'core';

export class SubmitReturnOrderCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly order: ReturnOrder,
    public readonly vcId: string
  ) { }
}
