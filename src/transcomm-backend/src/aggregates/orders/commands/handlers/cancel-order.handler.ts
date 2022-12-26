import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ModeType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { CancelOrderCommand } from '../impl/cancel-order';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: CancelOrderCommand): Promise<void> {
    const { cancelOrder, aggregateId } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      this.logger.log(
        `No OrderAggregate found for aggregate key: ${aggregateId.key()}`,
      );
      return;
    }
    if (
      orderAggregate.order.mode !== ModeType.Final &&
      orderAggregate.order.mode !== ModeType.Basic
    ) {
      orderAggregate.addErrorEvent(
        'CancelOrder',
        '2001009',
        'Error: Cannot cancel as order/invoice should be in BASIC | FINALIZED | FAILED state',
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }
    if (orderAggregate.updateTransportInfoMethodInvoked) {
      this.logger.log(
        `Cannot cancel order with ${cancelOrder.orderNumber} since the transport info method has already been invoked`,
      );
      orderAggregate.addErrorEvent(
        'CancelOrder',
        '',
        `Cannot cancel order with ${cancelOrder.orderNumber} since the transport info method has already been invoked`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }
    orderAggregate.cancelOrder(cancelOrder);
    orderAggregate.commit();
  }
}
