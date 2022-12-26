import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { ConfirmReturnDeliveryMessageReceivedCommand } from '../impl/confirm-return-delivery-message';

@CommandHandler(ConfirmReturnDeliveryMessageReceivedCommand)
export class ConfirmReturnDeliveryMessageReceivedCommandHandler
  implements ICommandHandler<ConfirmReturnDeliveryMessageReceivedCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(
    command: ConfirmReturnDeliveryMessageReceivedCommand,
  ): Promise<void> {
    const { aggregateId, vcId, confirmReturnDelivery } = command;
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

    orderAggregate.confirmReturnDeliveryMessageReceived(aggregateId.orderId, vcId, confirmReturnDelivery);
    orderAggregate.commit();
  }
}
