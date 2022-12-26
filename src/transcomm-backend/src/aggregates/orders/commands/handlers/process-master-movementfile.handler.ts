import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessMasterMovementFileCommand } from '../impl/process-master-movement-file';

@CommandHandler(ProcessMasterMovementFileCommand)
export class ProcessMasterMovementFileHandler
  implements ICommandHandler<ProcessMasterMovementFileCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessMasterMovementFileCommand): Promise<void> {
    const { movementFileData, aggregateId, hawb } = command;
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
    orderAggregate.processMasterMovementFile(movementFileData, hawb);

    orderAggregate.commit();
  }
}
