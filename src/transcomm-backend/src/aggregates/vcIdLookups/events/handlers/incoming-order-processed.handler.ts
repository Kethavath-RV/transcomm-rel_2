import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProcessNotificationProcessedCommand } from 'aggregates/orders/commands/impl/process-notification-processed';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { VcIdLookupAggregate } from 'aggregates/vcIdLookups/vcid-lookup-aggregate';
import { LookupType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { IncomingOrderProcessedEvent } from '../impl/incoming-order-processed.event';

@EventsHandler(IncomingOrderProcessedEvent)
export class IncomingOrderProcessedHandler
  implements IEventHandler<IncomingOrderProcessedEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly commandBus: CommandBus, private readonly repository: AggregateRepository) { }
  async handle(event: IncomingOrderProcessedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));
    this.logger.log(`vc: ${event.aggregateId} eventType: ${event.eventType} successfully processed`);

    const lookupAggregate: VcIdLookupAggregate | null =
      await this.repository.getById(
        VcIdLookupAggregate,
        'vcIdLookup',
        event.aggregateId,
      );

    if (event.lookupType === LookupType.Error) {
      return;
    }

    const orderAggregateKey = new OrderAggregateKey(
      event.orderId,
      event.ecomCode,
    );

    this.commandBus.execute(
      new ProcessNotificationProcessedCommand(
        orderAggregateKey,
        event.orderId,
        event.lookupType,
        event.aggregateId,
        lookupAggregate?.invoiceNumber
      ),
    );
  }
}
