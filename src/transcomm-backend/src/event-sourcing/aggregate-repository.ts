import { Injectable } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import { Type } from './utils';
import { EventStore } from './eventstore';
import { StoreEventPublisher } from './store-event-publisher';

@Injectable()
export class AggregateRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly publisher: StoreEventPublisher,
  ) { }

  async getById<T extends AggregateRoot>(
    type: Type<T>,
    aggregateName: string,
    aggregateId: string,
  ): Promise<T | null> {
    const aggregateEvents = await this.eventStore.getEvents(
      aggregateName,
      aggregateId,
    );

    if (!aggregateEvents || aggregateEvents.length === 0) {
      return null;
    }
    const aggregateType = this.publisher.mergeClassContext(type);

    const aggregate = new aggregateType(aggregateId);

    aggregate.loadFromHistory(aggregateEvents);

    return aggregate;
  }
}
