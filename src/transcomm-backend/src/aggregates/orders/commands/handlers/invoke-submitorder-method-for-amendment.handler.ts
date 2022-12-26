import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ContractMethod,
  ContractType,
  Direction,
  HyperledgerResponse,
  SubmitOrder,
} from 'core';
import { AggregateRepository } from 'event-sourcing';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { ApplicationError } from '../../../../models/error.model';
import { OrderAggregate } from '../../order-aggregate';
import { InvokeSubmitOrderMethodForAmendmentCommand } from '../impl/invoke-submitorder-method-for-amendment';

@CommandHandler(InvokeSubmitOrderMethodForAmendmentCommand)
export class InvokeSubmitOrderMethodForAmendmentCommandHandler
  implements ICommandHandler<InvokeSubmitOrderMethodForAmendmentCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeSubmitOrderMethodForAmendmentCommand,
  ): Promise<void> {
    const {
      invoiceNumber,
      aggregateId,
      retriedBy,
      remark,
      returnRequestNumber,
    } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate: OrderAggregate | null = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No orderaggregate found for aggregate id : ' + aggregateId.key(),
      );
    }

    const order = orderAggregate.order;

    try {
      const orderToSend = this.findInvoiceAndSetMode(order, invoiceNumber);
      let resp: HyperledgerResponse;

      if (orderAggregate.direction === Direction.Return) {
        const returnRequest = orderAggregate.returns.find((returnReq) => {
          return returnReq.returns.some((returnOrder) => {
            return returnOrder.returnRequestNo === returnRequestNumber;
          });
        });

        if (!returnRequest) {
          throw new Error(
            `Return order not found for returnRequestNo ${returnRequestNumber}`,
          );
        }

        resp = await this.datagenClient.invokeReturnOrder(
          returnRequest.request,
        );
      } else {
        resp = await this.datagenClient.invokeSubmitOrder(orderToSend);
      }

      orderAggregate.processHyperledgerSubmitOrderForAmendmentResponse(
        invoiceNumber,
        resp.message.txnId,
        resp,
        retriedBy,
        remark,
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        orderAggregate.addErrorEvent(
          'InvokeSubmitOrderMethodForAmendmentCommand',
          '',
          'Error on order submitted (mode = ' +
            order.mode +
            ') with hyperledger with error: ' +
            error.errorMessage,
          new Date().toISOString(),
        );
        orderAggregate.processHyperledgerError(
          error,
          ContractType.SubmitOrder,
          ContractMethod.SubmitOrderModeUpdate,
        );
      } else {
        orderAggregate.addErrorEvent(
          'InvokeSubmitOrderMethodForAmendmentCommand',
          '',
          'Error on order submitted (mode = ' +
            order.mode +
            ') with hyperledger with error: ' +
            error.errorMessage,
          new Date().toISOString(),
        );
      }
    } finally {
      orderAggregate.commit();
    }
  }

  private findInvoiceAndSetMode(order: SubmitOrder, invoiceNumber: string) {
    const invoiceToSend = order.invoices.find(
      (inv) => inv.invoiceNumber === invoiceNumber,
    );
    if (!invoiceToSend)
      throw new Error(
        'InvokeSubmitOrderMethodForAmendmentCommand: No invoice with invoicenumber' +
          invoiceNumber,
      );
    const orderToSend = { ...order };
    orderToSend.invoices = [invoiceToSend];
    return orderToSend;
  }
}
