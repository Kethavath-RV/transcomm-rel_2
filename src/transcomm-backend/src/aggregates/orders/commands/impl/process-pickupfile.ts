import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CheckPointFile } from 'core';

export class ProcessPickupFileCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly pickupFileData: CheckPointFile,
  ) {}
}
