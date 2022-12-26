import { DHLEDeclarationRequest } from 'core';
import { StorableEvent } from 'event-sourcing';

export class DeclarationRequestReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly declarationRequestData: DHLEDeclarationRequest,
  ) {
    super();
  }
}
