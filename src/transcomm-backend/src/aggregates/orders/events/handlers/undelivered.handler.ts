import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { UndeliveredEvent } from '../impl/undelivered.event';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(UndeliveredEvent)
export class UndeliveredHandler implements IEventHandler<UndeliveredEvent> {
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);
  async handle(event: UndeliveredEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const aggregateId = event.aggregateId;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + aggregateId);
    }

    await this.viewService.HydrateViews(orderAggregate);
    this.logger.log('Undelivered persisted');
  }
}
