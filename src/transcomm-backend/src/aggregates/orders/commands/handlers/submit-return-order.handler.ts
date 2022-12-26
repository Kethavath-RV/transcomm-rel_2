import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { SubmitReturnOrderCommand } from '../impl/return-order';
import { ModeType, YesNo } from 'core';

@CommandHandler(SubmitReturnOrderCommand)
export class SubmitReturnOrderHandler
  implements ICommandHandler<SubmitReturnOrderCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: SubmitReturnOrderCommand): Promise<void> {
    const { order, aggregateId, vcId } = command;
    this.logger.debug(JSON.stringify(command));

    if (!order.orderNumber) throw Error('Invalid order id');

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No orderaggregate found for aggregate id: ' + aggregateId.key(),
      );
    }

    if (orderAggregate.order.mode !== ModeType.Final) {
      this.logger.error(`Order ${aggregateId.key()} is not in final mode`);
      orderAggregate.addErrorEvent(
        'SubmitReturnOrder',
        '',
        `Error: Order ${aggregateId.key()} is not in final mode`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    // Validation:
    // Item where Duty Paid = Y will not be allowed to be returned.
    const lineItemNumbersWithDutyPaid: number[] = [];
    orderAggregate.order.invoices.forEach((inv) => {
      inv.lineItems.forEach((lineItem) => {
        // if (lineItem.dutyPaid === YesNo.Yes)
          lineItemNumbersWithDutyPaid.push(lineItem.lineNo);
      });
    });

    let foundError = false;
    order.invoices.forEach((inv) => {
      if (
        inv.lineItems.some((lineItem) =>
          lineItemNumbersWithDutyPaid.includes(lineItem.lineNo),
        )
      ) {
        this.logger.error(
          'Order: ' +
          order.orderNumber +
          '- Item where Duty Paid = Y will not be allowed to be returned.',
        );
        foundError = true
        orderAggregate.addErrorEvent(
          'SubmitReturnOrder',
          '',
          `Order ${aggregateId.key()} - Item where Duty Paid = Y will not be allowed to be returned.`,
          new Date().toISOString(),
        );
      }
    });

    if (!foundError) {
      orderAggregate.submitReturnOrder(order, vcId);
    }
    orderAggregate.commit();
  }
}
