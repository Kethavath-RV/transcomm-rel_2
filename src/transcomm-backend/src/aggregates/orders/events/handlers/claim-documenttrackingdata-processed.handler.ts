import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import { ClaimDocumentTrackingDataProcessedEvent } from '../impl/claim-documenttrackingdata-processed.event';

@EventsHandler(ClaimDocumentTrackingDataProcessedEvent)
export class ClaimDocumentTrackingDataProcessedEventHandler
  implements IEventHandler<ClaimDocumentTrackingDataProcessedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: ClaimDocumentTrackingDataProcessedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));
    const { aggregateId, documentTrackingData } = event;

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + aggregateId);
    }

    const invoice = orderAggregate.order.invoices.find(
      (i) => i.invoiceNumber === documentTrackingData.invoiceNo,
    );
    if (!invoice) {
      const errorMessage = `No invoice found for: ${documentTrackingData.invoiceNo}`;
      this.logger.error(errorMessage);

      orderAggregate.addErrorEvent(
        'ClaimDocumentTrackingDataProcessedEvent',
        '',
        errorMessage,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    const declaration = invoice.declarations?.find((d) => d.declarationNumber);

    if (!declaration) {
      const errorMessage = `Invoice ${documentTrackingData.invoiceNo} does not have a declaration`;
      this.logger.error(errorMessage);

      orderAggregate.addErrorEvent(
        'ClaimDocumentTrackingDataProcessedEvent',
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
