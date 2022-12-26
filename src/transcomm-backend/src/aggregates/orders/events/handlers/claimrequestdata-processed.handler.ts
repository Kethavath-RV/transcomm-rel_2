import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ClaimRequestDataProcessedEvent } from '../impl/claimrequestdata-processed.event';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(ClaimRequestDataProcessedEvent)
export class ClaimRequestDataProcessedEventHandler
  implements IEventHandler<ClaimRequestDataProcessedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: ClaimRequestDataProcessedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    let declarationFound = false;

    const declarationNumber =
      event.claimRequestData.DataArea.ClaimCreationRequest.DeclarationNumber;

    for (const invoice of orderAggregate.order.invoices) {
      if (invoice && invoice.declarations) {
        for (const d of invoice.declarations) {
          if (d.declarationNumber === declarationNumber) {
            declarationFound = true;
            break;
          }
        }
      }
    }

    if (!declarationFound) {
      const errorMessage = `Declaration ${declarationNumber} not found`;
      this.logger.error(errorMessage);

      orderAggregate.addErrorEvent(
        'ClaimRequestDataProcessedEvent',
        '',
        errorMessage,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }


    await this.viewService.HydrateViews(orderAggregate);
  }
}
