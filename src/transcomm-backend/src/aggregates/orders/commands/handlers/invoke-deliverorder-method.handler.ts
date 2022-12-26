import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import { InvokeDeliverOrderMethodCommand } from '../impl/invoke-deliverorder-method';
import { ContractMethod, ContractType } from 'core';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeDeliverOrderMethodCommand)
export class InvokeDeliverOrderMethodCommandHandler
  implements ICommandHandler<InvokeDeliverOrderMethodCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(command: InvokeDeliverOrderMethodCommand): Promise<void> {
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

    try {
      const resp = await this.datagenClient.invokeDeliverOrder(orderAggregate);
      orderAggregate.processDeliverOrderResponse(
        resp,
        command.retriedBy,
        command.remark,
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        orderAggregate.addErrorEvent(
          'InvokeDeliverOrderMethodCommand',
          '',
          `Order ${aggregateId.key()} - ${error.errorMessage}`,
          new Date().toISOString(),
        );
        orderAggregate.processHyperledgerError(
          error,
          ContractType.DeliverOrder,
          ContractMethod.DeliverOrder,
        );
      } else {
        this.logger.error(
          `Error occurred when invoking deliver order; request orderaggregate: ${aggregateId.key()}`,
          error,
        );
        orderAggregate.addErrorEvent(
          'InvokeDeliverOrderMethodCommand',
          '',
          `Order ${aggregateId.key()} - ${error.errorMessage}`,
          new Date().toISOString(),
        );
      }
    } finally {
      orderAggregate.commit();
    }
  }
}
