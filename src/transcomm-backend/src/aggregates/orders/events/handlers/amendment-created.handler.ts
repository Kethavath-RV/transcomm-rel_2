import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from 'event-sourcing';
import { AmendmentCreatedEvent } from '../impl/amendment-created.event';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { InvokeSubmitOrderMethodForAmendmentCommand } from 'aggregates/orders/commands/impl/invoke-submitorder-method-for-amendment';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(AmendmentCreatedEvent)
export class AmendmentCreatedEventHandler
  implements IEventHandler<AmendmentCreatedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService,
  ) {}

  private logger = new Logger(this.constructor.name);
  async handle(event: AmendmentCreatedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    const invoice = orderAggregate.order.invoices.find(
      (i) => i.invoiceNumber === event.invoiceNumber,
    );
    if (!invoice) {
      this.logger.error(
        `invoice amendment with id ${event.invoiceNumber} has no relating invoice on the aggregate`,
      );
      orderAggregate.addErrorEvent(
        'AmendmentCreated',
        '',
        `Order ${orderAggregate.id} - invoice amendment with id ${event.invoiceNumber} has no relating invoice on the aggregate`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    await this.viewService.HydrateViews(orderAggregate);

    await this.commandBus.execute(
      new InvokeSubmitOrderMethodForAmendmentCommand(
        new OrderAggregateKey(
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode,
        ),
        orderAggregate.order.orderNumber,
        event.invoiceNumber,
        orderAggregate.order.ecomBusinessCode,
        event.returnRequestNumber,
      ),
    );
  }
}
