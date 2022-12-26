import { DHLEDeclarationRequest } from 'core';
import { StorableEvent } from 'event-sourcing';

export class IncomingDeclarationRequestEvent extends StorableEvent {
  aggregateEvent = 'airwayToOrderIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
    public readonly ecomCode: string,
    public readonly declarationRequestData: DHLEDeclarationRequest,
  ) {
    super();
  }
}
