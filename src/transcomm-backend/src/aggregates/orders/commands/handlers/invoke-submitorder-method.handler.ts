import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { InvokeSubmitOrderMethodCommand } from '../impl/invoke-submitorder-method';
import { ContractMethod, ContractType, ModeType, SubmitOrder } from 'core';
import { OrderAggregate } from '../../../orders/order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeSubmitOrderMethodCommand)
export class InvokeSubmitOrderMethodHandler
  implements ICommandHandler<InvokeSubmitOrderMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(command: InvokeSubmitOrderMethodCommand): Promise<void> {
    const { aggregateId } = command;
    this.logger.debug(JSON.stringify(command));
    const orderAggregate: OrderAggregate | null = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No orderaggregate found for aggregate id: ' + aggregateId.key(),
      );
    }

    if (
      orderAggregate.order &&
      orderAggregate.orderProcessed &&
      !orderAggregate.submitOrderMethodInvoked
    ) {
      const order = orderAggregate.order;

      this.setModesForOrder(order, ModeType.Basic);
      try {
        const submitBasicResp = await this.datagenClient.invokeSubmitOrder(
          order,
        );
        orderAggregate.processHyperledgerSubmitOrderResponse(
          submitBasicResp,
          command.retriedBy,
          command.remark,
        );
      } catch (error) {
        if (error instanceof ApplicationError) {
          this.logger.error(JSON.stringify(error));
          orderAggregate.addErrorEvent(
            'InvokeSubmitOrderMethodCommand',
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
            ContractMethod.SubmitOrderModeBasic,
          );
        } else {
          orderAggregate.addErrorEvent(
            'InvokeSubmitOrderMethodCommand',
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
  }

  private setModesForOrder(order: SubmitOrder, mode: ModeType) {
    order.mode = mode;
    order.invoices.forEach((inv) => {
      inv.mode = mode;
      inv.lineItems.forEach((lineItem) => (lineItem.mode = mode));
    });
  }
}
