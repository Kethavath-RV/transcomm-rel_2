import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { MasterMovement } from 'core';

export class ProcessMasterMovementFileCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderId: string,
    public readonly movementFileData: MasterMovement,
    public readonly hawb: string,
  ) { }
}
