import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import { InvokeUpdateExitConfirmationCommand } from '../impl/invoke-updateexitconfirmation-method';
import { ContractMethod, ContractType } from 'core';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeUpdateExitConfirmationCommand)
export class InvokeUpdateExitConfirmationCommandHandler
  implements ICommandHandler<InvokeUpdateExitConfirmationCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(command: InvokeUpdateExitConfirmationCommand): Promise<void> {
    const { aggregateId, orderNumber, declarationNumber, retriedBy, remark } =
      command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate: OrderAggregate | null = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for aggregate id: ' + aggregateId);
    }

    try {
      const resp = await this.datagenClient.invokeUpdateExitConfirmation(
        orderAggregate,
        declarationNumber,
      );
      orderAggregate.processUpdateExitConfirmationResponse(
        resp,
        retriedBy,
        remark,
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        orderAggregate.addErrorEvent(
          orderNumber,
          'InvokeUpdateExitConfirmationCommand',
          'Error: ' + error.errorMessage,
          new Date().toISOString(),
        );
        orderAggregate.processHyperledgerError(
          error,
          ContractType.SubmitOrder,
          ContractMethod.SubmitOrderModeFinal,
        );
      } else {
        orderAggregate.addErrorEvent(
          orderNumber,
          'InvokeUpdateExitConfirmationCommand',
          'Error: ' + error.errorMessage,
          new Date().toISOString(),
        );
      }
    } finally {
      orderAggregate.commit();
    }
  }
}
