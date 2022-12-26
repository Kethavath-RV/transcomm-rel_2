import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { ContractMethod, ContractType } from 'core';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { InvokeCancelOrderMethodCommand } from '../impl/invoke-cancelorder-method';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeCancelOrderMethodCommand)
export class InvokeCancelOrderMethodCommandHandler
  implements ICommandHandler<InvokeCancelOrderMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(command: InvokeCancelOrderMethodCommand): Promise<void> {
    const { aggregateId, vcId, retriedBy } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate: OrderAggregate | null = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        `No orderaggregate found for aggregate id: ${aggregateId.key()}`,
      );
    }

    try {
      const response = await this.datagenClient.invokeSubmitOrder(
        orderAggregate.order,
      );
      orderAggregate.processHyperledgerSubmitCancelOrderResponse(
        response,
        vcId,
        retriedBy,
      );
    } catch (error) {
      this.logger.error(
        `Error occurred when submitting cancel request orderaggregate: ${aggregateId.key()}`,
        error,
      );
      if (error instanceof ApplicationError) {
        this.createError(orderAggregate, error.errorMessage);
        this.createHyperledgerError(orderAggregate, error, vcId);
      } else {
        this.createError(orderAggregate, error.errorMessage);
      }
    }

    orderAggregate.commit();
  }

  private createError(
    orderAggregate: OrderAggregate,
    additionalErrorText?: string,
  ): void {
    const className = this.constructor.name;
    orderAggregate.addErrorEvent(
      className,
      'Technical',
      `Error whilst attempting to submit order (mode = C) ${
        additionalErrorText ? additionalErrorText : ''
      }`,
      new Date().toISOString(),
    );
  }

  private createHyperledgerError(
    orderAggregate: OrderAggregate,
    error: ApplicationError,
    vcId: string,
  ): void {
    orderAggregate.processHyperledgerError(
      error,
      ContractType.SubmitOrder,
      ContractMethod.SubmitOrderModeCancel,
      vcId,
    );
  }
}
