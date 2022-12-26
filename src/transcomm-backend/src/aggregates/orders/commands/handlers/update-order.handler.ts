import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { UpdateOrderCommand } from '../impl/update-order';
import { CustomsStatus } from 'core';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler implements ICommandHandler<UpdateOrderCommand> {
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly publisher: StoreEventPublisher,
    private readonly repository: AggregateRepository,
  ) { }

  async execute(command: UpdateOrderCommand): Promise<void> {
    const { aggregateId, order } = command;
    this.logger.debug(JSON.stringify(command));

    if (!aggregateId.orderId || !aggregateId.ecomCode) {
      throw Error('Empty order id or ecomCode');
    }

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

    //Foreach invoice on the updated order, check if related aggregate.order invoice has an clearence status of rejected
    order.invoices.forEach(updatedInv => {
      const currInv = orderAggregate.order.invoices.find(i => i.invoiceNumber === updatedInv.invoiceNumber);
      if (!currInv) {
        this.logger.error(
          `Update Order failed: Invoice: ${updatedInv.invoiceNumber} was not present within the order ${order.orderNumber}`,
        );
        orderAggregate.addErrorEvent(
          'UpdateOrder',
          '',
          `Update Order failed: Invoice: ${updatedInv.invoiceNumber} was not present within the order ${order.orderNumber}`,
          new Date().toISOString(),
        );
      } else if (!currInv.declarations) {
        this.logger.error(
          `Update Order failed: Invoice: ${updatedInv.invoiceNumber} has no attached Declaration`,
        );
        orderAggregate.addErrorEvent(
          'UpdateOrder',
          '',
          `Update Order failed: Invoice: ${updatedInv.invoiceNumber} has no attached Declaration`,
          new Date().toISOString(),
        );
      } else if (currInv.declarations[0].clearanceStatus !== CustomsStatus.Rejected) {
        this.logger.error(
          `Update Order failed: Invoice: ${updatedInv.invoiceNumber} with declaration ${currInv.declarations[0].declarationNumber} has a clearanceStatus that is not 'Rejected'`,
        );
        orderAggregate.addErrorEvent(
          'UpdateOrder',
          '',
          `Update Order failed: Invoice: ${updatedInv.invoiceNumber} with declaration ${currInv.declarations[0].declarationNumber} has a clearanceStatus that is not 'Rejected'`,
          new Date().toISOString(),
        );
      } else {
        orderAggregate.updateOrder(order);
      }
    })

    orderAggregate.commit();
  }
}
