import { StorableEvent } from 'event-sourcing';

export class AirwayBillNumberToOrderIdLookupCreatedEvent extends StorableEvent {
  aggregateEvent = 'airwayToOrderIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
  ) {
    super();
  }
}
