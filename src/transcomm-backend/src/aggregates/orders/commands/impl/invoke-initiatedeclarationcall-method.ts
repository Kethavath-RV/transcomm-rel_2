import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class InvokeInitiateDeclarationCallMethodCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly invoiceNumber: string,
    public readonly retriedBy: string | null = null,
    public readonly remark: string | null = null,
  ) {}
}
