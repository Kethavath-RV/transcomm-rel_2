import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import { ConfirmReturnDeliveryMessageReceivedEvent } from '../impl/confirmreturndeliverymessagereceived.event';

@EventsHandler(ConfirmReturnDeliveryMessageReceivedEvent)
export class ConfirmReturnDeliveryMessageReceivedEventHandler
  implements IEventHandler<ConfirmReturnDeliveryMessageReceivedEvent>
{
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  async handle(
    event: ConfirmReturnDeliveryMessageReceivedEvent,
  ): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(OrderAggregate, 'order', event.aggregateId);
    if (!orderAggregate) {
      throw Error("No orderaggregate found for orderId: " + event.aggregateId)
    }


    this.viewService.HydrateViews(orderAggregate);
  }
}
