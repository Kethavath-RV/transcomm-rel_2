import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderStatus } from '@prisma/client';
import { ContractMethod, ContractType, ModeType, SubmitOrder } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { ApplicationError } from '../../../../models/error.model';
import { OrderAggregate } from '../../../orders/order-aggregate';
import { InvokeSubmitOrderModeFinalMethodCommand } from '../impl/invoke-submitordermodefinal-method';

@CommandHandler(InvokeSubmitOrderModeFinalMethodCommand)
export class InvokeSubmitOrderModeFinalMethodHandler
  implements ICommandHandler<InvokeSubmitOrderModeFinalMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeSubmitOrderModeFinalMethodCommand,
  ): Promise<void> {
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
      orderAggregate.status == OrderStatus.ReturnCreated &&
      orderAggregate.pickupFileAddedForReturn &&
      orderAggregate.orderReturnProcessed
    ) {
      const order = orderAggregate.order;

      try {
        const submitFinalResp = await this.datagenClient.invokeSubmitOrder(
          order,
        );
        orderAggregate.processHyperledgerSubmitOrderModeFinalResponse(
          submitFinalResp,
          command.retriedBy,
          command.remark,
        );
        return;
      } catch (error) {
        if (error instanceof ApplicationError) {
          orderAggregate.addErrorEvent(
            'InvokeSubmitOrderModeFinalMethodCommand',
            '',
            'Error on order submitted (mode = ' +
              order.mode +
              ') with hyperledger with error: ' +
              error,
            new Date().toISOString(),
          );
          orderAggregate.processHyperledgerError(
            error,
            ContractType.SubmitOrder,
            ContractMethod.SubmitOrderModeFinal,
          );
        } else {
          orderAggregate.addErrorEvent(
            'InvokeSubmitOrderModeFinalMethodCommand',
            '',
            'Error on order submitted (mode = ' +
              order.mode +
              ') with hyperledger with error: ' +
              error,
            new Date().toISOString(),
          );
        }
      } finally {
        orderAggregate.commit();
      }
      return;
    }

    if (
      orderAggregate.order &&
      orderAggregate.orderProcessed &&
      orderAggregate.submitOrderMethodInvoked &&
      !orderAggregate.submitOrderModeFinalMethodInvoked
    ) {
      const order = orderAggregate.order;
      try {
        this.setModesForOrder(order, ModeType.Final);
        const submitFinalResp = await this.datagenClient.invokeSubmitOrder(
          order,
        );
        if (!submitFinalResp) {
          this.logger.error('Transcom backend internal logic error');
          orderAggregate.addErrorEvent(
            'InvokeSubmitOrderModeFinal',
            '',
            `Order ${aggregateId.key} - Transcom backend internal logic error
            }`,
            new Date().toISOString(),
          );
          return;
        }
        orderAggregate.processHyperledgerSubmitOrderModeFinalResponse(
          submitFinalResp,
          command.retriedBy,
          command.remark,
        );
      } catch (error) {
        orderAggregate.addErrorEvent(
          'InvokeSubmitOrderModeFinalMethodCommand',
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
          ContractMethod.SubmitOrderModeFinal,
        );
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
