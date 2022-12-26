import { DeclarationResponse } from 'core';
import { StorableEvent } from 'event-sourcing';

export class DHLEDeclarationResponseSentEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly detailedEvent: DeclarationResponse,
    public readonly timeStamp: string,
  ) {
    super();
  }
}
