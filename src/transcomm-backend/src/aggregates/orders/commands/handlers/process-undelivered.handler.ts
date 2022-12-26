import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessUndeliveredCommand } from '../impl/process-undelivered';

@CommandHandler(ProcessUndeliveredCommand)
export class ProcessUndeliveredHandler
  implements ICommandHandler<ProcessUndeliveredCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessUndeliveredCommand): Promise<void> {
    const { pickupFileData, aggregateId } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No order aggregate found for aggregate id: ' + aggregateId.key(),
      );
    }

    orderAggregate.processUndelivered(pickupFileData);
    orderAggregate.commit();
  }
}
