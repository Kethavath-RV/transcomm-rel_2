import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import { ContractMethod, ContractType } from 'core';
import { InvokeReturnUpdateTransportInfoMethodCommand } from '../impl/invoke-return-updatetransportinfo-method';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeReturnUpdateTransportInfoMethodCommand)
export class InvokeReturnUpdateTransportInfoMethodHandler
  implements ICommandHandler<InvokeReturnUpdateTransportInfoMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeReturnUpdateTransportInfoMethodCommand,
  ): Promise<void> {
    const { aggregateId, vcId, retriedBy } = command;
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

    const returnRequest = orderAggregate.returns.find((x) => x.vcId === vcId);

    if (!returnRequest)
      throw Error(
        `return request not found for vcid: ${vcId} aggregate id: ${aggregateId.key()}`,
      );
    if (returnRequest.updatedShipping) {
      this.logger.log(
        `return request already invoked delivered therefore will not be invoked again`,
      );
      return;
    }

    if (orderAggregate.order && returnRequest.movementData) {
      try {
        const resp = await this.datagenClient.invokeUpdateTransportInfo(
          orderAggregate,
          returnRequest,
        );
        orderAggregate.processHyperledgerReturnUpdateTransportInfoResponse(
          resp,
          vcId,
          retriedBy,
        );
      } catch (error) {
        this.logger.error(
          `error occurred when submitting transport details for a return request orderaggregate: ${aggregateId.key()}`,
          error,
        );
        if (error instanceof ApplicationError) {
          this.createError(orderAggregate, error.errorMessage);
          this.createHyperledgerError(orderAggregate, error, vcId);
        } else {
          this.createError(orderAggregate, error.errorMessage);
        }
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
      `Error whilst attempting to submit transport details for a return request ${
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
      ContractType.UpdateTransportInfo,
      ContractMethod.UpdateTransportInfoModeReturn,
      vcId,
    );
  }
}
