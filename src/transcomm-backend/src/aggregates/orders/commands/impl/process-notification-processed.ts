import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { LookupType } from 'core';

export class ProcessNotificationProcessedCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderId: string,
    public readonly lookupType: LookupType,
    public readonly vcId: string,
    public readonly invoiceNumber?: string,
  ) { }
}
