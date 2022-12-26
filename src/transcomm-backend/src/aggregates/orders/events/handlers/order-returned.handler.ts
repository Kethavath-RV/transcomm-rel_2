import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderReturnedEvent } from '../impl/order-returned.event';
import { ValidateDataIsPresent } from './helpers/validateDataIsPresent';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(OrderReturnedEvent)
export class OrderReturnedHandler implements IEventHandler<OrderReturnedEvent> {
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: OrderReturnedEvent): Promise<void> {
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

    const isDataValid = ValidateDataIsPresent(
      'orderReturned',
      orderAggregate,
      event.order,
    );
    if (!isDataValid) {
      return;
    }

    this.viewService.HydrateViews(orderAggregate);
  }

}
