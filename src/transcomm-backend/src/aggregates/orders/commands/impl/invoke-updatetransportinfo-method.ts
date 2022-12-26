import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class InvokeUpdateTransportInfoMethodCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly retriedBy: string | null = null,
    public readonly remark: string | null = null,
  ) {}
}
