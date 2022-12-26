import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class InvokeUpdateTransportInfoMethodForAmendmentCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly txnId: string,
    public readonly ecomNumber: string,
    public readonly invoiceNumber: string,
    public readonly retriedBy: string | null = null,
    public readonly remark: string | null = null,
  ) {}
}
