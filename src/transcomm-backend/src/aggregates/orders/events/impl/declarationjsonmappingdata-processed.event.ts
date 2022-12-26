import { StorableEvent } from 'event-sourcing';
import { DeclarationJsonMappingData } from 'core';

export class DeclarationJsonMappingDataProcessedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly declarationJsonMappingData: DeclarationJsonMappingData,
  ) {
    super();
  }
}
