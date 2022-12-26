import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class SendDHLEDeclarationResponseCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly key: string,
  ) {}
}
