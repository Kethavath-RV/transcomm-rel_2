import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { DeclarationJsonMappingDataProcessedEvent } from '../impl/declarationjsonmappingdata-processed.event';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { SendDHLEDeclarationResponseCommand } from '../../commands/impl/send-dhle-declaration-response';
import { OrderAggregateKey } from '../../order-aggregate-key';

@EventsHandler(DeclarationJsonMappingDataProcessedEvent)
export class DeclarationJsonMappingDataProcessedEventHandler
  implements IEventHandler<DeclarationJsonMappingDataProcessedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly viewService: ViewsService,
    private readonly commandBus: CommandBus,
  ) {}

  private logger = new Logger(this.constructor.name);
  async handle(event: DeclarationJsonMappingDataProcessedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error(`No order with orderId: ${event.aggregateId} was found`);
    }

    if (
      orderAggregate.isDeclarationResponseComplete(
        event.declarationJsonMappingData.Key,
      )
    ) {
      try {
        await this.commandBus.execute(
          new SendDHLEDeclarationResponseCommand(
            new OrderAggregateKey(
              orderAggregate.order.orderNumber,
              orderAggregate.order.ecomBusinessCode,
            ),
            event.declarationJsonMappingData.Key,
          ),
        );
      } catch (e) {
        this.logger.error(
          `Command bus was unable to execute SendDHLEDeclarationResponseCommand. Error: ${JSON.stringify(
            e,
          )}`,
        );
      }
    }

    this.viewService.HydrateViews(orderAggregate);
  }
}
