import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessDeclarationRequestCommand } from '../impl/process-declaration-request';

@CommandHandler(ProcessDeclarationRequestCommand)
export class ProcessDeclarationRequestCommandHandler
  implements ICommandHandler<ProcessDeclarationRequestCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(command: ProcessDeclarationRequestCommand): Promise<void> {
    const { declarationRequestData, aggregateId } = command;
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

    orderAggregate.processDeclarationRequest(declarationRequestData);

    orderAggregate.commit();
  }
}
