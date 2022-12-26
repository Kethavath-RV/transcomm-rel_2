import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvokeReturnUpdateTransportInfoMethodCommand } from 'aggregates/orders/commands/impl/invoke-return-updatetransportinfo-method';
import { InvokeUpdateTransportInfoMethodCommand } from 'aggregates/orders/commands/impl/invoke-updatetransportinfo-method';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Direction } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { CreateAmendmentFromDeclarationRequestCommand } from '../../commands/impl/create-amendment-declaration-request';
import { DeclarationRequestReceivedEvent } from '../impl/declaration-request-received';

@EventsHandler(DeclarationRequestReceivedEvent)
export class DeclarationRequestReceivedEventHandler
  implements IEventHandler<DeclarationRequestReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService,
  ) {}
  private logger = new Logger(this.constructor.name);
  async handle(event: DeclarationRequestReceivedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const AggregateId = event.aggregateId;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      AggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + AggregateId);
    }

    /**
     * If the declaration of the order is in a rejected state, do an amendment
     * with the invoice data of the incoming declaration request
     */
    if (orderAggregate.readyForManualAmendment) {
      const invoiceNumber =
        event.declarationRequestData.Declaration.Consignments.ShippingDetails
          .Invoices[0]?.InvoiceNumber;

      if (!invoiceNumber) {
        throw new Error(
          `No invoiceNumber found in incoming Declaration Request: ${JSON.stringify(
            event.declarationRequestData,
          )}`,
        );
      }

      const transportDocumentDetails =
        event.declarationRequestData.Declaration.Consignments.DeclarationDetails
          .TransportDocumentDetails[0];
      const airwayBillNumber =
        orderAggregate.direction === Direction.Return
          ? transportDocumentDetails.InboundTransportDocumentNo
          : transportDocumentDetails.OutboundTransportDocumentNo;

      if (!airwayBillNumber) {
        throw new Error(
          `No airwayBillNumber found in incoming Declaration Request: ${JSON.stringify(
            event.declarationRequestData,
          )}`,
        );
      }

      this.commandBus.execute(
        new CreateAmendmentFromDeclarationRequestCommand(
          new OrderAggregateKey(
            orderAggregate.order.orderNumber,
            orderAggregate.order.ecomBusinessCode,
          ),
          orderAggregate.order.orderNumber,
          orderAggregate.order.ecomBusinessCode,
          invoiceNumber,
          airwayBillNumber,
        ),
      );
      /**
       * Else use the movement data of the declaration request to invoke an updateTransportInfo
       */
    } else {
      if (orderAggregate.direction === Direction.Outbound) {
        if (orderAggregate.order && orderAggregate.submitOrderMethodInvoked) {
          this.commandBus.execute(
            new InvokeUpdateTransportInfoMethodCommand(
              new OrderAggregateKey(
                orderAggregate.order.orderNumber,
                orderAggregate.order.ecomBusinessCode,
              ),
            ),
          );
        }
      }

      if (orderAggregate.direction === Direction.Return) {
        const airwaybillNumber =
          event.declarationRequestData.Declaration.Consignments
            .DeclarationDetails.TransportDocumentDetails[0]
            .InboundTransportDocumentNo;
        const returnedOrder = orderAggregate.returns.find(
          (x) => x.pickupFile?.hawb === airwaybillNumber,
        );
        if (
          returnedOrder &&
          returnedOrder.submitted &&
          !returnedOrder.updatedShipping
        ) {
          this.commandBus.execute(
            new InvokeReturnUpdateTransportInfoMethodCommand(
              new OrderAggregateKey(
                orderAggregate.order.orderNumber,
                orderAggregate.order.ecomBusinessCode,
              ),
              returnedOrder.vcId,
            ),
          );
        }
      }
    }

    this.viewService.HydrateViews(orderAggregate);
  }
}
