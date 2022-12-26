import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from '../../order-aggregate';
import { DatagenClient } from '../../../../datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import { OrderStatus } from '@prisma/client';
import { ContractMethod, ContractType } from 'core';
import { InvokeInitiateDeclarationCallMethodForAmendmentCommand } from '../impl/invoke-initiatedeclarationcall-method-for-amendment';
import { ApplicationError } from '../../../../models/error.model';

@CommandHandler(InvokeInitiateDeclarationCallMethodForAmendmentCommand)
export class InvokeInitiateDeclarationCallMethodForAmendmentCommandHandler
  implements
    ICommandHandler<InvokeInitiateDeclarationCallMethodForAmendmentCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly datagenClient: DatagenClient,
  ) {}

  async execute(
    command: InvokeInitiateDeclarationCallMethodForAmendmentCommand,
  ): Promise<void> {
    const { orderNumber, invoiceNumber, aggregateId } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate: OrderAggregate | null = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No orderaggregate found for aggregate id : ' + aggregateId.key(),
      );
    }

    if (orderAggregate.status === OrderStatus.OrderCancelled) {
      this.logger.log(
        `Cannot invoke the initiate declaration method for order with order id: ${orderNumber}, since its status is 'Cancelled'`,
      );
      orderAggregate.addErrorEvent(
        'InvokeInitialDeclarationCallForAmendment',
        '',
        `Order ${aggregateId.key()} - Cannot invoke the initiate declaration method for order with order id: ${orderNumber}, since its status is 'Cancelled'`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    if (orderAggregate.order) {
      try {
        const resp = await this.datagenClient.invokeInitiateDeclaration(
          orderAggregate,
          invoiceNumber,
        );
        orderAggregate.processHyperledgerInitiateDeclarationCallForAmendmentResponse(
          resp,
          invoiceNumber,
        );
      } catch (error) {
        this.logger.error(
          `Error occurred when submitting initiate declaration call; request orderaggregate: ${aggregateId.key()}`,
          error,
        );
        if (error instanceof ApplicationError) {
          orderAggregate.addErrorEvent(
            'InvokeInitiateDeclarationCall',
            '',
            'Error: ' + error.errorMessage,
            new Date().toISOString(),
          );
          orderAggregate.processHyperledgerError(
            error,
            ContractType.InitiateDeclaration,
            ContractMethod.InitiateDeclaration,
          );
        } else {
          orderAggregate.addErrorEvent(
            'InvokeInitiateDeclarationCall',
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
