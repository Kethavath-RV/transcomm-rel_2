import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from 'event-sourcing';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: OrderCreatedEvent): Promise<void> {
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
    this.logger.log('Order persisted');
  }
}
