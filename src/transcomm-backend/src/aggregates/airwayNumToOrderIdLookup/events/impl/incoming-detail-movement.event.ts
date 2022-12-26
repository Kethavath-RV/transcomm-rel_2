import { DetailMovement } from 'core';
import { StorableEvent } from 'event-sourcing';

export class IncomingDetailMovementEvent extends StorableEvent {
  aggregateEvent = 'airwayToOrderIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
    public readonly movementFileData: DetailMovement,
  ) {
    super();
  }
}
