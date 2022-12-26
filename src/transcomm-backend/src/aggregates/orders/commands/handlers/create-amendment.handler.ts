import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository } from 'event-sourcing';
import { CreateAmendmentCommand } from '../impl/create-amendment';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';

@CommandHandler(CreateAmendmentCommand)
export class CreateAmendmentCommandHandler
  implements ICommandHandler<CreateAmendmentCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(command: CreateAmendmentCommand): Promise<void> {
    const { ecomBusinessCode, invoiceNumber, userId, amendment, aggregateId } =
      command;
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

    const invoiceToAmend = orderAggregate.order?.invoices?.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );
    if (!invoiceToAmend) {
      this.logger.error(
        `Order ${aggregateId.key()} has no invoice with found with number: ${invoiceNumber}`,
      );
      orderAggregate.addErrorEvent(
        'CreateAmendment',
        '2001065',
        `Order ${aggregateId.key()} has no invoice with found with number: ${invoiceNumber}`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    if (!invoiceToAmend.locked) {
      this.logger.error(`Order ${aggregateId.key()} is not locked`);
      orderAggregate.addErrorEvent(
        'CreateAmendment',
        '',
        `Order ${aggregateId.key()} is not locked`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    if (invoiceToAmend.lockedBy !== userId) {
      this.logger.error(
        `Order ${aggregateId.key()} is not locked by user with id: ${userId}`,
      );
      orderAggregate.addErrorEvent(
        'CreateAmendment',
        '',
        `Order ${aggregateId.key()} is not locked by user with id: ${userId}`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    // TODO returns should also work from UI

    orderAggregate.submitAmendment(
      ecomBusinessCode,
      invoiceNumber,
      amendment,
      null,
    );
    orderAggregate.commit();
  }
}
