import { StorableEvent } from '../../../../event-sourcing';

export class OrderUnlockedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly invoiceNumber: string,
    public readonly username: string,
  ) {
    super();
  }
}
