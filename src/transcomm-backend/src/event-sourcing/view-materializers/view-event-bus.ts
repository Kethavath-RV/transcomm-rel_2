import { IEventBus } from '@nestjs/cqrs/dist/interfaces';
import { Injectable } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { ViewMaterializer } from './view-materializer';

@Injectable()
export class ViewEventBus implements IEventBus {
  constructor(
    private readonly eventBus: EventBus,
    private viewUpdater: ViewMaterializer,
  ) {}
  publish<T extends IEvent>(event: T): any {
    this.viewUpdater
      .run(event)
      .then(() => this.eventBus.publish(event))
      .catch((err) => {
        throw err;
      });
  }

  publishAll(events: IEvent[]): any {
    (events || []).forEach((event) => this.publish(event));
  }
}
