import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvokeInitiateDeclarationCallMethodForAmendmentCommand } from 'aggregates/orders/commands/impl/invoke-initiatedeclarationcall-method-for-amendment';
import { InvokeSubmitOrderModeFinalMethodCommand } from 'aggregates/orders/commands/impl/invoke-submitordermodefinal-method';
import { InvokeUpdateTransportInfoMethodForAmendmentCommand } from 'aggregates/orders/commands/impl/invoke-updatetransportinfo-method-for-amendment';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { ModeType } from 'core';
import { DatabaseService } from 'database/database.service';
import { AggregateRepository } from 'event-sourcing';
import { OrderDataProcessedEvent } from '../impl/orderdata-processed.event';

@EventsHandler(OrderDataProcessedEvent)
export class OrderDataProcessedEventEventHandler
  implements IEventHandler<OrderDataProcessedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly prisma: DatabaseService,
    private readonly commandBus: CommandBus,
    private configService: ConfigService,
    private readonly viewService: ViewsService
  ) { }

  private logger = new Logger(this.constructor.name);
  async handle(event: OrderDataProcessedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      event.aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + event.aggregateId);
    }

    this.viewService.HydrateViews(orderAggregate);

    if (event.orderData?.current?.errorBusiness && event.orderData?.current?.errorBusiness.length !== 0) {
      event.orderData.current.errorBusiness.forEach((error) => {
        if (error.errorValidation && error.errorValidation.length !== 0) {
          error.errorValidation.forEach((errorValidation) => {
            orderAggregate.addErrorEvent(
              errorValidation.methodName,
              errorValidation.errorCode,
              errorValidation.errorDescription,
              event.orderData.current.actionDate ? event.orderData.current.actionDate : new Date().toISOString(),
            );
          })
        }
      });

      orderAggregate.commit();
    } else {

      //InvokeUpdateTransportInfoMethodForAmendmentCommand or InvokeInitiateDeclarationCallMethodForAmendmentCommand if order went through amendment flow, depending on which have happened so far
      if (orderAggregate.order.mode === ModeType.Update) {
        for (const amendmentData of orderAggregate.amendmends) {

          //Check if txnId of HL query is the same as the submitOrderForAmendment call to HL
          if (amendmentData.txnIdSubmitOrder === event.txnId) {
            if (amendmentData.submitOrderMethodInvokedForAmendment && !amendmentData.updateTransportInfoMethodInvokedForAmendment) {
              await this.commandBus.execute(
                new InvokeUpdateTransportInfoMethodForAmendmentCommand(
                  new OrderAggregateKey(orderAggregate.order.orderNumber, orderAggregate.order.ecomBusinessCode),
                  orderAggregate.order.orderNumber,
                  event.txnId,
                  orderAggregate.order.ecomBusinessCode,
                  amendmentData.invoiceNumber
                ),
              );
            }
            //It should not be the case that the same txId could be present in multiple amends, so break if found
            break;
          }
          else if (amendmentData.txnIdUpdateTransportInfo === event.txnId) {
            if (amendmentData.updateTransportInfoMethodInvokedForAmendment && !amendmentData.initiateDeclarationcallMethodInvokedForAmendment) {
              await this.commandBus.execute(
                new InvokeInitiateDeclarationCallMethodForAmendmentCommand(
                  new OrderAggregateKey(orderAggregate.order.orderNumber, orderAggregate.order.ecomBusinessCode,),
                  event.aggregateId,
                  amendmentData.invoiceNumber
                ),
              );
            }
            //It should not be the case that the same txId could be present in multiple amends, so break if found
            break;
          }
        }
      }

      if (event.orderData.current.mode === ModeType.Basic && event.msgType === (this.configService.get("SUBMITORDER_ORDER_DATA_MESSAGE_TYPE") ?? "TC_DHLE_CORD_ODAT")) {
        await this.commandBus.execute(new InvokeSubmitOrderModeFinalMethodCommand(
          new OrderAggregateKey(orderAggregate.order.orderNumber, orderAggregate.order.ecomBusinessCode), orderAggregate.order.orderNumber, orderAggregate.order.ecomBusinessCode, null)
        );
      }
    }
  }
}
