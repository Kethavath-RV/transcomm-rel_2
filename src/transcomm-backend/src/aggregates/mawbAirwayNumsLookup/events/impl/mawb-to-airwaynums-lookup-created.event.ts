import { StorableEvent } from 'event-sourcing';

export class MawbToAirwayNumsLookupCreatedEvent extends StorableEvent {
  aggregateEvent = 'mawbToAirwayIdLookup';
  constructor(
    public readonly aggregateId: string,
    public readonly airwayNums: string[],
  ) {
    super();
  }
}
