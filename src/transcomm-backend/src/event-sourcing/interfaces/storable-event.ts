import { IEvent } from '@nestjs/cqrs/dist/interfaces';

export abstract class StorableEvent implements IEvent {
  abstract aggregateId: string;
  abstract aggregateEvent: string;
  public readonly eventType: string;
  public readonly timeStamp: string;

  protected constructor() {
    this.eventType = this.constructor.name;
    this.timeStamp = new Date().toISOString();
  }
}
