import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from '../../../orders/order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import { InvokeUpdateTransportInfoMethodCommand } from '../impl/invoke-updatetransportinfo-method';
import { ContractMethod, ContractType } from 'core';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeUpdateTransportInfoMethodCommand)
export class InvokeUpdateTransportInfoMethodHandler
  implements ICommandHandler<InvokeUpdateTransportInfoMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeUpdateTransportInfoMethodCommand,
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
      orderAggregate.order &&
      !orderAggregate.updateTransportInfoMethodInvoked
    ) {
      try {
        const resp = await this.datagenClient.invokeUpdateTransportInfo(
          orderAggregate,
        );
        orderAggregate.processHyperledgerUpdateTransportInfoResponse(
          resp,
          command.retriedBy,
          command.remark,
        );
      } catch (error) {
        if (error instanceof ApplicationError) {
          orderAggregate.addErrorEvent(
            'InvokeUpdateTransportInfoMethodCommand',
            '',
            'Error: ' + error.errorMessage,
            new Date().toISOString(),
          );
          orderAggregate.processHyperledgerError(
            error,
            ContractType.UpdateTransportInfo,
            ContractMethod.UpdateTransportInfo,
          );
        } else {
          orderAggregate.addErrorEvent(
            'InvokeUpdateTransportInfoMethodCommand',
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
}
