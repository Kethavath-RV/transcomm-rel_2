import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import { OtherCheckpointFileReceivedEvent } from '../impl/other-checkpointfile-received.event';

@EventsHandler(OtherCheckpointFileReceivedEvent)
export class OtherCheckpointFileReceivedHandler
  implements IEventHandler<OtherCheckpointFileReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);
  async handle(event: OtherCheckpointFileReceivedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const { aggregateId } = event;
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
