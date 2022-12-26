import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from '../../../../event-sourcing';
import { OrderAggregate } from '../../order-aggregate';
import { OrderLockedEvent } from '../impl/order-locked.event';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(OrderLockedEvent)
export class OrderLockedEventHandler
  implements IEventHandler<OrderLockedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: OrderLockedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    this.viewService.HydrateViews(orderAggregate);
  }
}
