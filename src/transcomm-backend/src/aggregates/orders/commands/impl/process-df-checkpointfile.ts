import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CheckPointFile } from 'core';

export class ProcessDfCheckpointFileCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly pickupFileData: CheckPointFile,
  ) {}
}
