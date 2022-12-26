import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { Country } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { ProcessDeliveredCommand } from '../impl/process-delivered';

@CommandHandler(ProcessDeliveredCommand)
export class ProcessDeliveredHandler
  implements ICommandHandler<ProcessDeliveredCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessDeliveredCommand): Promise<void> {
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

    if (pickupFileData.destination === Country.UnitedArabEmirates) {
      this.logger.error(
        `Error: Exit is expected as destination is not AE for pickup deliverOrder`,
      );
      orderAggregate.addErrorEvent(
        'DeliverOrder',
        '2001026',
        'Error: Exit is expected as destination is not AE',
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    orderAggregate.processDelivered(pickupFileData);
    orderAggregate.commit();
  }
}
