import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ProcessDeclarationRequestCommand } from '../../../orders/commands/impl/process-declaration-request';
import { IncomingDeclarationRequestEvent } from '../impl/incoming-declaration-request.event';

@EventsHandler(IncomingDeclarationRequestEvent)
export class IncomingDeclarationRequestEventHandler
  implements IEventHandler<IncomingDeclarationRequestEvent>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly commandBus: CommandBus) {}
  handle(event: IncomingDeclarationRequestEvent): void {
    this.logger.debug(JSON.stringify(event));
    const orderAggregateKey = new OrderAggregateKey(
      event.orderId,
      event.ecomCode,
    );
    this.commandBus.execute(
      new ProcessDeclarationRequestCommand(
        orderAggregateKey,
        event.orderId,
        event.declarationRequestData,
      ),
    );
  }
}
