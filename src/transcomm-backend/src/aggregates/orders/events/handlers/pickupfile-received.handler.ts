import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import { PickupFileReceivedEvent } from '../impl/pickupfile-received.event';

@EventsHandler(PickupFileReceivedEvent)
export class PickupFileReceivedHandler
  implements IEventHandler<PickupFileReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);
  async handle(event: PickupFileReceivedEvent): Promise<void> {
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
  }
}
