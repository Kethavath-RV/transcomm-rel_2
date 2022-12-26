import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { Amendment } from 'core';

export class CreateAmendmentCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly ecomBusinessCode: string,
    public readonly invoiceNumber: string,
    public readonly userId: string,
    public readonly amendment: Amendment,
  ) {}
}
