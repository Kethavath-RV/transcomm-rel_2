import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessOtherCheckpointFileCommand } from '../impl/process-other-checkpointfile';

@CommandHandler(ProcessOtherCheckpointFileCommand)
export class ProcessOtherCheckpointFileHandler
  implements ICommandHandler<ProcessOtherCheckpointFileCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessOtherCheckpointFileCommand): Promise<void> {
    const { pickupFileData, aggregateId } = command;
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

    orderAggregate.processOtherCheckpointFile(pickupFileData);
    orderAggregate.commit();
  }
}
