import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { ContractMethod, ContractType } from 'core';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { InvokeUpdateOrderMethodCommand } from '../impl/invoke-updateorder-method';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeUpdateOrderMethodCommand)
export class InvokeUpdateOrderMethodCommandHandler
  implements ICommandHandler<InvokeUpdateOrderMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(command: InvokeUpdateOrderMethodCommand): Promise<void> {
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
      //handle success
      orderAggregate.processHyperledgerSubmitUpdateOrderResponse(
        response,
        vcId,
        retriedBy,
      );
    } catch (error) {
      this.logger.error(
        `Error occurred when submitting update request orderaggregate: ${aggregateId.key()}`,
        error,
      );
      if (error instanceof ApplicationError) {
        this.createError(orderAggregate, error.errorMessage);
        if (error.errorCode.slice(0, 2) === 'HL') {
          this.createHyperledgerError(orderAggregate, error, vcId);
        }
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
      ContractMethod.SubmitOrderModeUpdate,
      vcId,
    );
  }
}
