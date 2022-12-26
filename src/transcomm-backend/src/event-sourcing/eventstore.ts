import { Injectable, Logger } from '@nestjs/common';
import { StorableEvent } from './interfaces';
import {
  EventStoreDBClient,
  FORWARDS,
  jsonEvent,
  START,
} from '@eventstore/db-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventStore {
  private logger = new Logger(this.constructor.name);
  private readonly eventStoreClient: EventStoreDBClient;
  private eventStoreLaunched = false;

  constructor(private configService: ConfigService) {
    const eventStoreConnectionString =
      configService.get('EVENTSTORE_CONNECTION_STRING') ??
      'esdb://localhost:2113?tls=false';
    try {
      this.eventStoreClient = EventStoreDBClient.connectionString(
        eventStoreConnectionString,
      );
    } catch (err) {
      this.logger.log(err);
      throw err;
    }
    this.logger.log('Event Store launched!');
    this.eventStoreLaunched = true;
  }

  public isInitiated(): boolean {
    return this.eventStoreLaunched;
  }

  public async getEvents<T extends StorableEvent>(
    aggregate: string,
    id: string,
  ): Promise<StorableEvent[]> {
    let events = await this.eventStoreClient
      .readStream(EventStore.getAggregateId(aggregate, id), {
        direction: FORWARDS,
        fromRevision: START,
      })
      .catch((e) => {
        return;
      });
    if (!events) {
      events = [];
    }
    return events.map(($event) => {
      return EventStore.getStorableEventFromPayload(
        JSON.parse($event.event?.data as string),
      );
    });
  }

  public async storeEvent<T extends StorableEvent>(event: T): Promise<void> {
    if (!this.eventStoreLaunched) {
      throw Error('Event store not connected.');
    }
    try {
      // TODO add metadata for correlationId and causationId. An author would also be good
      const eventPayload = jsonEvent({
        type: event.eventType,
        data: JSON.stringify(event),
      });
      const streamName = EventStore.getAggregateId(
        event.aggregateEvent,
        event.aggregateId,
      );
      await this.eventStoreClient.appendToStream(streamName, eventPayload);
    } catch (err) {
      this.logger.log(err);
      return;
    }
  }

  private static getStorableEventFromPayload(payload: any): StorableEvent {
    const eventPlain = payload;
    eventPlain.constructor = { name: eventPlain.eventType };

    return Object.assign(Object.create(eventPlain), eventPlain);
  }

  private static getAggregateId(aggregate: string, id: string): string {
    return aggregate + '-' + id;
  }
}
