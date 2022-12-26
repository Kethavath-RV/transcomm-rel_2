import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvokeCancelOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-cancelorder-method';
import { InvokeConfirmReturnDeliveryMethodCommand } from 'aggregates/orders/commands/impl/invoke-confirmreturndelivery-method';
import { InvokeReturnOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-returnorder-method';
import { InvokeSubmitOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-submitorder-method';
import { InvokeUpdateOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-updateorder-method';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { LookupType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { NotificationProcessedReceivedEvent } from '../impl/notification-processed.event';

@EventsHandler(NotificationProcessedReceivedEvent)
export class NotificationProcessedHandler
  implements IEventHandler<NotificationProcessedReceivedEvent>
{
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService

  ) { }

  async handle(event: NotificationProcessedReceivedEvent): Promise<void> {
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

    switch (event.lookupType) {
      case LookupType.Order:
        this.ProcessedOrderHandler(orderAggregate);
        break;
      case LookupType.ConfirmReturn:
        this.ConfirmReturnDeliveryHandler(orderAggregate, event);
        break;
      case LookupType.ReturnOrder:
        this.ReturnOrderHandler(orderAggregate, event);
        break;
      case LookupType.CancelOrder:
        this.CancelOrderHandler(orderAggregate, event);
        break;
      case LookupType.UpdateOrder:
        this.UpdateOrderHandler(orderAggregate, event);
        break;
      default:
        break;
    }

    this.viewService.HydrateViews(orderAggregate);
  }

  private ProcessedOrderHandler(orderAggregate: OrderAggregate): void {
    this.commandBus.execute(
      new InvokeSubmitOrderMethodCommand(
        new OrderAggregateKey(
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode
        ),
        orderAggregate.order.orderNumber,
        orderAggregate.order.ecomBusinessCode,
        null,
        ''
      )
    );
  }

  private ConfirmReturnDeliveryHandler(orderAggregate: OrderAggregate, event: NotificationProcessedReceivedEvent): void {
    if (!event.invoiceNumber) {
      orderAggregate.addErrorEvent(
        'NotificationProcessedReceived',
        '',
        `Order ${orderAggregate.id} - No invoiceNumber on NotificationProcessedReceivedEvent, needed for confirmReturnDelivery`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    this.commandBus.execute(
      new InvokeConfirmReturnDeliveryMethodCommand(
        new OrderAggregateKey(
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode,
        ),
        orderAggregate.order.orderNumber,
        orderAggregate.order.ecomBusinessCode,
        event.invoiceNumber,
        event.vcId
      ),
    );
  }

  private ReturnOrderHandler(orderAggregate: OrderAggregate, event: NotificationProcessedReceivedEvent) {
    this.commandBus.execute(
      new InvokeReturnOrderMethodCommand(
        new OrderAggregateKey(
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode
        ),
        event.vcId
      )
    );
  }

  private CancelOrderHandler(orderAggregate: OrderAggregate, event: NotificationProcessedReceivedEvent) {
    this.commandBus.execute(
      new InvokeCancelOrderMethodCommand(
        new OrderAggregateKey(
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode
        ),
        event.vcId
      )
    );
  }

  private UpdateOrderHandler(orderAggregate: OrderAggregate, event: NotificationProcessedReceivedEvent) {
    this.commandBus.execute(
      new InvokeUpdateOrderMethodCommand(
        new OrderAggregateKey(
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode
        ),
        event.vcId
      )
    );
  }
}
