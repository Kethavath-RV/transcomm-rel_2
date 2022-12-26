import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProcessMasterMovementFileCommand } from 'aggregates/orders/commands/impl/process-master-movement-file';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { IncomingMasterMovementFileEvent } from '../impl/incoming-master-movement-file.event';

@EventsHandler(IncomingMasterMovementFileEvent)
export class IncomingMasterMovementFileHandler
  implements IEventHandler<IncomingMasterMovementFileEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly commandBus: CommandBus) { }
  handle(event: IncomingMasterMovementFileEvent): void {
    this.logger.debug(JSON.stringify(event));
    const orderAggregateKey = new OrderAggregateKey(
      event.orderId,
      event.ecomCode,
    );
    this.commandBus.execute(
      new ProcessMasterMovementFileCommand(
        orderAggregateKey,
        event.orderId,
        event.movementFileData,
        event.aggregateId
      ),
    );
  }
}
