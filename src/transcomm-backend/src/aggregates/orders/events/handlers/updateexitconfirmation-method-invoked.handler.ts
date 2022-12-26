import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import { UpdateExitConfirmationMethodInvokedEvent } from '../impl/updateexitconfirmation-method-invoked.event';

@EventsHandler(UpdateExitConfirmationMethodInvokedEvent)
export class UpdateExitConfirmationMethodInvokedEventHandler
  implements IEventHandler<UpdateExitConfirmationMethodInvokedEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly viewService: ViewsService,
    private readonly repository: AggregateRepository) { }
  async handle(
    event: UpdateExitConfirmationMethodInvokedEvent,
  ): Promise<void> {
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
