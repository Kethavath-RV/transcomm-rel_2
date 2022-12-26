import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvokeUpdateExitConfirmationCommand } from 'aggregates/orders/commands/impl/invoke-updateexitconfirmation-method';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CustomsStatus, DocumentTrackingError } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { DocumentTrackingErrorClass } from 'models/documenttrackingErrorClass';
import { CreateAmendmentFromDeclarationRequestCommand } from '../../commands/impl/create-amendment-declaration-request';
import { SendDHLEDeclarationResponseCommand } from '../../commands/impl/send-dhle-declaration-response';
import { DeclarationDocumentTrackingDataProcessedEvent } from '../impl/declaration-documenttrackingdata-processed.event';

@EventsHandler(DeclarationDocumentTrackingDataProcessedEvent)
export class DeclarationDocumentTrackingDataProcessedEventHandler
  implements IEventHandler<DeclarationDocumentTrackingDataProcessedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService,
  ) {}

  private logger = new Logger(this.constructor.name);
  async handle(
    event: DeclarationDocumentTrackingDataProcessedEvent,
  ): Promise<void> {
    this.logger.debug(JSON.stringify(event));
    const { documentTrackingData } = event;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );

    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    const invoice = orderAggregate.order.invoices.find(
      (x) => x.invoiceNumber === event.documentTrackingData.invoiceNo,
    );

    if (!invoice) {
      const errorMessage = `No invoice found for: ${event.documentTrackingData.documentNo}`;
      this.logger.error(errorMessage);

      orderAggregate.addErrorEvent(
        'DeclarationDocumentTrackingDataProcessedEvent',
        '',
        errorMessage,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    const declaration = invoice.declarations?.find(
      (x) => x.hlKey === event.documentTrackingData.Key,
    );
    if (!declaration) {
      const errorMessage = `No declaration found for: ${event.documentTrackingData.documentNo}`;
      this.logger.error(errorMessage);

      orderAggregate.addErrorEvent(
        'DeclarationDocumentTrackingDataProcessedEvent',
        '',
        errorMessage,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    this.logger.debug(declaration);

    await this.viewService.HydrateViews(orderAggregate);

    if (
      orderAggregate.isDeclarationResponseComplete(
        event.documentTrackingData.Key,
      )
    ) {
      try {
        await this.commandBus.execute(
          new SendDHLEDeclarationResponseCommand(
            new OrderAggregateKey(
              orderAggregate.order.orderNumber,
              orderAggregate.order.ecomBusinessCode,
            ),
            event.documentTrackingData.Key,
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

    if (
      orderAggregate.dfCheckpointFileReceivedEvent &&
      declaration.clearanceStatus === CustomsStatus.Cleared &&
      declaration.declarationType === '303'
    ) {
      this.commandBus.execute(
        new InvokeUpdateExitConfirmationCommand(
          new OrderAggregateKey(
            orderAggregate.order.orderNumber,
            orderAggregate.order.ecomBusinessCode,
          ),
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode,
          invoice.invoiceNumber,
          declaration.declarationNumber,
        ),
      );
    }

    if (
      declaration.clearanceStatus === CustomsStatus.Error &&
      declaration.errors &&
      declaration.errors !== ''
    ) {
      let errors: DocumentTrackingError[] = JSON.parse(declaration.errors);
      if (!Array.isArray(errors)) errors = JSON.parse(errors);

      for (const error of errors) {
        const validatedError = plainToInstance(
          DocumentTrackingErrorClass,
          error,
        );
        const validationResults = validateSync(validatedError);
        if (validationResults.length > 0)
          throw Error(
            'Cannot parse declaration.errors to a valid error object',
          );

        orderAggregate.addErrorEvent(
          'DeclarationDocumentTrackingDataProcessed',
          validatedError.errorType,
          `Order ${event.aggregateId} - ${validatedError.errorCode} - ${validatedError.errorDescription}`,
          new Date().toISOString(),
          true,
        );
      }
    }

    if (
      declaration.clearanceStatus === CustomsStatus.Rejected &&
      orderAggregate.autoAmendmentPending
    ) {
      this.commandBus.execute(
        new CreateAmendmentFromDeclarationRequestCommand(
          new OrderAggregateKey(
            orderAggregate.order.orderNumber,
            orderAggregate.order.ecomBusinessCode,
          ),
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode,
          invoice.invoiceNumber,
          documentTrackingData.transportDocumentNo,
        ),
      );
    }

    orderAggregate.commit();
  }
}
