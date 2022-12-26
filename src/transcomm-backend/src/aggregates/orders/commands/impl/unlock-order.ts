import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { UserResponse } from 'core';

export class UnlockOrderCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly invoiceNumber: string,
    public readonly user: UserResponse,
  ) {}
}
