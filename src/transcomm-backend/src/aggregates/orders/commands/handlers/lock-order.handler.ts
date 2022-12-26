import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderAggregate } from '../../order-aggregate';
import { AggregateRepository } from '../../../../event-sourcing';
import { LockOrderCommand } from '../impl/lock-order';

@CommandHandler(LockOrderCommand)
export class LockOrderCommandHandler
  implements ICommandHandler<LockOrderCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(command: LockOrderCommand): Promise<void> {
    const { invoiceNumber, username, aggregateId } = command;
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
    orderAggregate.lockOrder(invoiceNumber, username);
    orderAggregate.commit();
  }
}
