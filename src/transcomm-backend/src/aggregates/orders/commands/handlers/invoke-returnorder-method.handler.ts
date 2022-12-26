import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AggregateRepository } from 'event-sourcing';
import { ContractMethod, ContractType, HyperledgerResponse } from 'core';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { InvokeReturnOrderMethodCommand } from '../impl/invoke-returnorder-method';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeReturnOrderMethodCommand)
export class InvokeReturnOrderMethodHandler
  implements ICommandHandler<InvokeReturnOrderMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(command: InvokeReturnOrderMethodCommand): Promise<void> {
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

    const returnRequest = orderAggregate.returns.find((x) => x.vcId === vcId);
    if (!returnRequest) {
      this.logger.error(
        `return request for vc ${vcId}  was found on orderaggregate: ${aggregateId.key()}`,
      );
      this.createError(orderAggregate);
      orderAggregate.commit();
      return;
    }

    try {
      const response: HyperledgerResponse | null =
        await this.datagenClient.invokeReturnOrder(returnRequest.request); //this submits the order in return mode;
      //handle success
      orderAggregate.processHyperledgerSubmitReturnOrderResponse(
        response,
        vcId,
        retriedBy,
      );
    } catch (error) {
      this.logger.error(
        `error occurred when submitting return request orderaggregate: ${aggregateId.key()}`,
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
      `Error whilst attempting to submit order (mode return = R) ${
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
      ContractMethod.SubmitOrderModeReturn,
      vcId,
    );
  }
}
