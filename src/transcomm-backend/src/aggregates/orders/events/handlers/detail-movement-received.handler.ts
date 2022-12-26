import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { DetailMovementReceivedEvent } from '../impl/detail-movement-received';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { InvokeUpdateTransportInfoMethodCommand } from 'aggregates/orders/commands/impl/invoke-updatetransportinfo-method';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { Direction } from 'core';
import { InvokeReturnUpdateTransportInfoMethodCommand } from 'aggregates/orders/commands/impl/invoke-return-updatetransportinfo-method';
import { ViewsService } from 'aggregates/orders/views/views.service';

@EventsHandler(DetailMovementReceivedEvent)
export class DetailMovementReceivedHandler
  implements IEventHandler<DetailMovementReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);
  async handle(event: DetailMovementReceivedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const AggregateId = event.aggregateId;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      AggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + AggregateId);
    }

    if (orderAggregate.direction === Direction.Outbound) {
      if (
        orderAggregate.order &&
        orderAggregate.submitOrderMethodInvoked
      ) {
        this.commandBus.execute(
          new InvokeUpdateTransportInfoMethodCommand(
            new OrderAggregateKey(
              orderAggregate.order.orderNumber,
              orderAggregate.order.ecomBusinessCode,
            ),
          )
        )
      }
    }
    if (orderAggregate.direction === Direction.Return) {
      const returnedOrder = orderAggregate.returns.find(x => x.pickupFile?.hawb === event.detailMovementFile.airwayBillNumber);
      if (
        returnedOrder &&
        returnedOrder.submitted &&
        !returnedOrder.updatedShipping
      ) {
        this.commandBus.execute(
          new InvokeReturnUpdateTransportInfoMethodCommand(
            new OrderAggregateKey(
              orderAggregate.order.orderNumber,
              orderAggregate.order.ecomBusinessCode
            ),
            returnedOrder.vcId
          )
        )
      }
    }

    this.viewService.HydrateViews(orderAggregate);
  }
}
