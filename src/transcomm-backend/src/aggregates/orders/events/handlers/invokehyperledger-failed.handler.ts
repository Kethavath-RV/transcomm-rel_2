import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { DatabaseService } from 'database/database.service';
import { AggregateRepository } from 'event-sourcing';
import { InvokeHyperledgerFailedEvent } from '../impl/invokehyperledger-failed.event';

@EventsHandler(InvokeHyperledgerFailedEvent)
export class InvokeHyperledgerFailedEventHandler
  implements IEventHandler<InvokeHyperledgerFailedEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly prisma: DatabaseService,
    private readonly viewService: ViewsService,
  ) {}

  async handle(event: InvokeHyperledgerFailedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    await this.viewService.HydrateViews(orderAggregate);

    const invoiceId = orderAggregate.order.invoices[0].invoiceNumber;
    if (!invoiceId) {
      throw Error('No invoice id found for orderId: ' + event.aggregateId);
    }
    const manualRetryView = {
      vcId: event.vcId,
      contractType: event.contractType,
      ecomCode: orderAggregate.ecomBusinessCode,
      errorCode: event.errorCode ?? '',
      errorDesc: event.errorDescription ?? '',
      failDate: event.failureDate,
      invoiceNumber: invoiceId,
      orderNumber: orderAggregate.order.orderNumber,
      retryButton: true,
      status: 'open',
      contractMethod: event.contractMethod,
      remark: '',
      errorMessage: event.errorMessage ?? '',
    };
    await this.prisma.manualRetryView.upsert({
      where: {
        orderNumber_invoiceNumber_ecomCode_contractMethod: {
          contractMethod: event.contractMethod,
          ecomCode: orderAggregate.ecomBusinessCode,
          invoiceNumber: invoiceId,
          orderNumber: orderAggregate.order.orderNumber,
        },
      },
      create: manualRetryView,
      update: manualRetryView,
    });
  }
}
