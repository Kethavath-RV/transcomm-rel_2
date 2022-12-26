import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { DetailMovement } from 'core';

export class ProcessDetailMovementFileCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderId: string,
    public readonly movementFileData: DetailMovement,
  ) {}
}
