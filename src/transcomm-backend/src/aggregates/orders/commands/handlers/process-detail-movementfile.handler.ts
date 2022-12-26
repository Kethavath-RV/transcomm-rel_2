import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessDetailMovementFileCommand } from '../impl/process-detail-movement-file';

@CommandHandler(ProcessDetailMovementFileCommand)
export class ProcessDetailMovementHandler
  implements ICommandHandler<ProcessDetailMovementFileCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessDetailMovementFileCommand): Promise<void> {
    const { movementFileData, aggregateId } = command;
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

    orderAggregate.processDetailMovement(movementFileData);

    orderAggregate.commit();
  }
}
