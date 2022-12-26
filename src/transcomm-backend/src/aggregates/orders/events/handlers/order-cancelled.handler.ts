import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { OrderCancelledEvent } from '../impl/order-cancelled.event';
import { ValidateDataIsPresent } from './helpers/validateDataIsPresent';
import { Logger } from '@nestjs/common';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(OrderCancelledEvent)
export class OrderCancelledHandler
  implements IEventHandler<OrderCancelledEvent>
{
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  async handle(event: OrderCancelledEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderID = event.aggregateId;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      orderID,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + orderID);
    }

    const isDataValid = ValidateDataIsPresent(
      'orderCancelled',
      orderAggregate,
      event.cancelOrder,
    );
    if (!isDataValid) {
      return;
    }

    this.viewService.HydrateViews(orderAggregate);
  }
}
