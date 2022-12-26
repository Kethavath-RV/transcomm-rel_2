import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { DHLEDeclarationRequest } from 'core';

export class ProcessDeclarationRequestCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderId: string,
    public readonly declarationRequestData: DHLEDeclarationRequest,
  ) {}
}
