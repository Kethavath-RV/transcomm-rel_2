import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { MasterMovementFileReceivedEvent } from '../impl/master-movementfile-received';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(MasterMovementFileReceivedEvent)
export class MasterMovementFileReceivedHandler
  implements IEventHandler<MasterMovementFileReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);

  async handle(event: MasterMovementFileReceivedEvent): Promise<void> {
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

    this.viewService.HydrateViews(orderAggregate);

  }
}
