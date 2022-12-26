import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PerformDetailToOrderIdLookupCommand } from 'aggregates/airwayNumToOrderIdLookup/commands/impl/perform-detail-lookup';
import { IncomingDetailMovementFileEvent } from '../impl/incoming-detail-movement-file.event';

@EventsHandler(IncomingDetailMovementFileEvent)
export class IncomingDetailMovementFileHandler
  implements IEventHandler<IncomingDetailMovementFileEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly commandBus: CommandBus) { }
  handle(event: IncomingDetailMovementFileEvent): void {
    this.logger.debug(JSON.stringify(event));
    this.commandBus.execute(
      new PerformDetailToOrderIdLookupCommand(
        event.movementFileDetail.airwayBillNumber,
        event.movementFileDetail,
      ),
    );
  }
}
