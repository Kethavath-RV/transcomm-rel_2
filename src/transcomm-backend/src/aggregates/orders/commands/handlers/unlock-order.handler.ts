import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderAggregate } from '../../order-aggregate';
import { AggregateRepository } from '../../../../event-sourcing';
import { UnlockOrderCommand } from '../impl/unlock-order';
import { UserRole } from 'core';

@CommandHandler(UnlockOrderCommand)
export class UnlockOrderCommandHandler
  implements ICommandHandler<UnlockOrderCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(command: UnlockOrderCommand): Promise<void> {
    const { invoiceNumber, user, aggregateId } = command;
    this.logger.debug(JSON.stringify(command));

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

    //find invoice with that invoiceNumber
    //Check if locked by user or user is admin
    const invoice = orderAggregate.order.invoices.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );
    if (!(invoice?.lockedBy === user.email || user.role === UserRole.admin)) {
      throw Error('Invoice not locked by this user, and user is not admin');
    }

    orderAggregate.unlockOrder(invoiceNumber, user.email);
    orderAggregate.commit();
  }
}
