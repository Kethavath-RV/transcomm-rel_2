import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessDfCheckpointFileCommand } from '../impl/process-df-checkpointfile';

@CommandHandler(ProcessDfCheckpointFileCommand)
export class ProcessDfCheckpointFileHandler
  implements ICommandHandler<ProcessDfCheckpointFileCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessDfCheckpointFileCommand): Promise<void> {
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

    orderAggregate.processDfCheckpointFile(pickupFileData);
    orderAggregate.commit();
  }
}
