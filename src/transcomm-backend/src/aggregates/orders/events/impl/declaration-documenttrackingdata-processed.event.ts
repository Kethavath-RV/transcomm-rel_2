import { DocumentTrackingData } from 'core';
import { StorableEvent } from 'event-sourcing';

export class DeclarationDocumentTrackingDataProcessedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly documentTrackingData: DocumentTrackingData,
  ) {
    super();
  }
}
