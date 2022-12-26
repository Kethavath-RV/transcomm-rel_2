import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ContractMethod, ContractType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { ApplicationError } from '../../../../models/error.model';
import { OrderAggregate } from '../../order-aggregate';
import { InvokeConfirmReturnDeliveryMethodCommand } from '../impl/invoke-confirmreturndelivery-method';

@CommandHandler(InvokeConfirmReturnDeliveryMethodCommand)
export class InvokeConfirmReturnDeliveryMethodCommandHandler
  implements ICommandHandler<InvokeConfirmReturnDeliveryMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeConfirmReturnDeliveryMethodCommand,
  ): Promise<void> {
    const { aggregateId, vcId } = command;
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

    try {
      const confirmReturn = orderAggregate.confirmReturnDeliveries[vcId];
      if (!confirmReturn) throw Error('confirm return not found');
      const resp = await this.datagenClient.invokeConfirmReturnDelivery(
        orderAggregate,
        confirmReturn,
      );
      orderAggregate.processConfirmReturnDeliveryResponse(
        resp,
        command.retriedBy,
        command.remark,
      );
    } catch (error) {
      this.logger.error(
        `Error occurred when invoking deliver order; request orderaggregate: ${aggregateId.key()}`,
        error,
      );
      if (error instanceof ApplicationError) {
        orderAggregate.addErrorEvent(
          'InvokeConfirmReturnDeliveryMethodCommand',
          '',
          'Error: ' + error.errorMessage,
          new Date().toISOString(),
        );
        orderAggregate.processHyperledgerError(
          error,
          ContractType.ConfirmReturnDelivery,
          ContractMethod.ConfirmReturnDelivery,
        );
      } else {
        orderAggregate.addErrorEvent(
          'InvokeConfirmReturnDeliveryMethodCommand',
          '',
          'Error: ' + error.errorMessage,
          new Date().toISOString(),
        );
      }
    } finally {
      orderAggregate.commit();
    }
  }
}
