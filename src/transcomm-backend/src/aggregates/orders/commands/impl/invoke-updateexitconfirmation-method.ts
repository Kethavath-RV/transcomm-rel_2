import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class InvokeUpdateExitConfirmationCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly ecomCode: string,
    public readonly invoiceNumber: string,
    public readonly declarationNumber: string,
    public readonly retriedBy: string | null = null,
    public readonly remark: string | null = null,
  ) {}
}
