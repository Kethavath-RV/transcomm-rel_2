import { ContractMethod } from "core";
import { OrderAggregateKey } from "aggregates/orders/order-aggregate-key";

export class RetryHyperledgerCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderNumber: string,
    public readonly ecomCode: string,
    public readonly invoiceId: string,
    public readonly contractMethod: ContractMethod,
    public readonly username: string,
    public readonly vcId: string,
    public readonly remark: string | null
  ) {
  }
}