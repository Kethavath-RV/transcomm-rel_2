import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from '../../../../event-sourcing';
import { OrderAggregate } from '../../order-aggregate';
import { OrderUnlockedEvent } from '../impl/order-unlocked.event';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(OrderUnlockedEvent)
export class OrderUnlockedEventHandler
  implements IEventHandler<OrderUnlockedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: OrderUnlockedEvent): Promise<void> {
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
