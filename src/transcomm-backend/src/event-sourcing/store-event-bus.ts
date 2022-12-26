import { Injectable, Logger } from '@nestjs/common';
import { IEvent, IEventBus } from '@nestjs/cqrs/dist/interfaces';
import { EventStore } from './eventstore';
import { StorableEvent } from './interfaces';
import { ViewEventBus } from './view-materializers';

@Injectable()
export class StoreEventBus implements IEventBus {
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly eventBus: ViewEventBus,
    private readonly eventStore: EventStore,
  ) { }
  async publish<T extends IEvent>(event: T): Promise<void> {
    const storableEvent = event as any as StorableEvent;
    if (
      storableEvent.aggregateId === undefined ||
      storableEvent.aggregateEvent === undefined
    ) {
      throw new Error('Events must implement StorableEvent interface');
    }
    this.logger.debug('publish event: ' + JSON.stringify(event));
    await this.eventStore.storeEvent(storableEvent);
    this.eventBus.publish(event);
  }

  publishAll(events: IEvent[]): void {
    (events || []).forEach((event) => this.publish(event));
  }
}
