import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProcessDetailMovementFileCommand } from 'aggregates/orders/commands/impl/process-detail-movement-file';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { IncomingDetailMovementEvent } from '../impl/incoming-detail-movement.event';

@EventsHandler(IncomingDetailMovementEvent)
export class IncomingDetailMovementHandler
  implements IEventHandler<IncomingDetailMovementEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly commandBus: CommandBus) { }
  handle(event: IncomingDetailMovementEvent): void {
    this.logger.debug(JSON.stringify(event));
    const orderAggregateKey = new OrderAggregateKey(
      event.orderId,
      event.ecomCode,
    );
    this.commandBus.execute(
      new ProcessDetailMovementFileCommand(
        orderAggregateKey,
        event.orderId,
        event.movementFileData,
      ),
    );
  }
}
