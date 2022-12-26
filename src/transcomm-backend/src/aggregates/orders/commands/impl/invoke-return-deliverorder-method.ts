import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class InvokeReturnDeliverOrderMethodCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly vcId: string,
    public readonly retriedBy: string | null = null
  ) { }
}
