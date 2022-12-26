import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { DeliveredEvent } from '../impl/delivered.event';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { InvokeDeliverOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-deliverorder-method';
import { Direction } from 'core';
import { InvokeReturnDeliverOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-return-deliverorder-method';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(DeliveredEvent)
export class DeliveredHandler implements IEventHandler<DeliveredEvent> {
  constructor(
    private readonly repository: AggregateRepository,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);
  async handle(event: DeliveredEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const aggregateId = event.aggregateId;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for aggregate id: ' + aggregateId);
    }

    if (orderAggregate.direction === Direction.Outbound) {
      if (
        !orderAggregate.deliverOrderMethodInvoked
      ) {
        this.commandBus.execute(
          new InvokeDeliverOrderMethodCommand(
            new OrderAggregateKey(
              orderAggregate.order.orderNumber,
              orderAggregate.order.ecomBusinessCode,
            ),
            orderAggregate.order.orderNumber,
          ),
        );
      }
    }
    if (orderAggregate.direction === Direction.Return) {
      const returnRequest = orderAggregate.returns.find(x => x.pickupFile?.hawb === event.checkPointData.hawb);
      if (returnRequest && !returnRequest.delivered)
        this.commandBus.execute(
          new InvokeReturnDeliverOrderMethodCommand(
            new OrderAggregateKey(
              orderAggregate.order.orderNumber,
              orderAggregate.order.ecomBusinessCode
            ),
            returnRequest.vcId
          )
        )
    }

    this.viewService.HydrateViews(orderAggregate);
  }
}
