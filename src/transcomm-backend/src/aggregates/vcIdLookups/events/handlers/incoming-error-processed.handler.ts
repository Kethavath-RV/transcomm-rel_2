import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { IncomingErrorProcessedEvent } from '../impl/incoming-error-processed.event';

@EventsHandler(IncomingErrorProcessedEvent)
export class IncomingErrorProcessedHandler
  implements IEventHandler<IncomingErrorProcessedEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly commandBus: CommandBus, private readonly repository: AggregateRepository) { }
  async handle(event: IncomingErrorProcessedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));
    this.logger.log(`vc: ${event.aggregateId} eventType: ${event.eventType} successfully processed`);
  }
}
