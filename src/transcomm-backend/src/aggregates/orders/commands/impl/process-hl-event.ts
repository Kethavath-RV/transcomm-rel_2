import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import {
  ClaimRequestData,
  DeclarationJsonMappingData,
  DocumentTrackingData,
  InvoiceData,
  OrderData,
} from 'core';

export class ProcessHyperledgerEventCommand {
  constructor(
    public readonly aggregateId: OrderAggregateKey,
    public readonly orderId: string,
    public readonly invoiceId: string,
    public readonly eventType: string,
    public readonly msgType: string,   
    public readonly txnId: string,    
    public readonly hyperledgerEvent:
      | DocumentTrackingData
      | InvoiceData
      | DeclarationJsonMappingData
      | ClaimRequestData
      | OrderData,
  ) {}
}
