import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ErrorReceivedEvent } from '../impl/error-received.event';
import { AggregateRepository } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ErrorMessagePayloadModel, LookupType } from 'core';
import { BlessClientService } from 'bless/bless-client/bless-client.service';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CreateVcIdLookupCommand } from 'aggregates/vcIdLookups/commands/impl/create-vcId-lookup';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { generateVcId } from 'helpers/generateVcId';

@EventsHandler(ErrorReceivedEvent)
export class ErrorReceivedEventHandler
  implements IEventHandler<ErrorReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private blessClient: BlessClientService,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService,
    private readonly configService: ConfigService
  ) { }

  private senderId = this.configService.get("DATAGEN_KAFKA_SENDER_IDENTITY") ?? "DC-TC";
  private applicationId = this.configService.get("DATAGEN_APPLICATION_ID") ?? "DC-TC";

  private logger = new Logger(this.constructor.name);

  async handle(event: ErrorReceivedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    await this.viewService.HydrateViews(orderAggregate);

    const vcId = generateVcId(this.senderId, this.applicationId);

    await this.commandBus.execute(
      new CreateVcIdLookupCommand(
        vcId,
        orderAggregate.order.orderNumber,
        orderAggregate.order.ecomBusinessCode,
        LookupType.Error,
        event.commandName,
        event.errorCode,
        event.errorMessage
      ),
    );

    const errorMessagePayload: ErrorMessagePayloadModel = {
      id: uuidv4(),
      errorCode: event.errorCode,
      dateTime: Date.now().toString(),
      errorDesc: event.errorMessage,
      msgIdentifier: {
        orderNumber: orderAggregate.order.orderNumber,
        ecomBusinessCode: orderAggregate.order.ecomBusinessCode,
      },
    };

    await this.blessClient.postError(errorMessagePayload, vcId);
  }


}
