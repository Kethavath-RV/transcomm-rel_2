import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

export class CreateAmendmentFromDeclarationRequestCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly ecomBusinessCode: string,
    public readonly invoiceNumber: string,
    public readonly airwayBillNumber: string,
  ) {}
}
