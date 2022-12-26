import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ProcessNotificationProcessedCommand } from '../impl/process-notification-processed';

@CommandHandler(ProcessNotificationProcessedCommand)
export class ProcessNotificationHandler
  implements ICommandHandler<ProcessNotificationProcessedCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: ProcessNotificationProcessedCommand): Promise<void> {
    this.logger.debug(JSON.stringify(command));
    const { orderId, aggregateId, invoiceNumber, lookupType, vcId } = command;

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

    orderAggregate.processNotificationProcessed(
      orderId,
      lookupType,
      vcId,
      invoiceNumber ?? undefined,
    );
    orderAggregate.commit();
  }
}
