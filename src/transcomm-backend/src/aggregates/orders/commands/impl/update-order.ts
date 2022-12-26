import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { SubmitOrder } from 'core';

export class UpdateOrderCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly order: SubmitOrder,
  ) {}
}
