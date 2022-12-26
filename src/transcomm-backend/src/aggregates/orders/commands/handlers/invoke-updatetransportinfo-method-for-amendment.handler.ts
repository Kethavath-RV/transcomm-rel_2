import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import { InvokeUpdateTransportInfoMethodForAmendmentCommand } from '../impl/invoke-updatetransportinfo-method-for-amendment';
import { ContractMethod, ContractType } from 'core';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeUpdateTransportInfoMethodForAmendmentCommand)
export class InvokeUpdateTransportInfoMethodForAmendmentCommandHandler
  implements
    ICommandHandler<InvokeUpdateTransportInfoMethodForAmendmentCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeUpdateTransportInfoMethodForAmendmentCommand,
  ): Promise<void> {
    const { invoiceNumber, aggregateId, retriedBy, remark } = command;
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
      const resp = await this.datagenClient.invokeUpdateTransportInfo(
        orderAggregate,
      );
      orderAggregate.processHyperledgerUpdateTransportInfoResponseForAmendment(
        invoiceNumber,
        resp.message.txnId,
        resp,
        retriedBy,
        remark,
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        orderAggregate.addErrorEvent(
          'InvokeUpdateTransportInfoMethodForAmendmentCommand',
          '',
          'Error: ' + error.errorMessage,
          new Date().toISOString(),
        );
        orderAggregate.processHyperledgerError(
          error,
          ContractType.UpdateTransportInfo,
          ContractMethod.UpdateTransportInfoModeUpdate,
        );
      } else {
        orderAggregate.addErrorEvent(
          'InvokeUpdateTransportInfoMethodForAmendmentCommand',
          '',
          'Error: ' + (error as Error).message,
          new Date().toISOString(),
        );
      }
    } finally {
      orderAggregate.commit();
    }
  }
}
