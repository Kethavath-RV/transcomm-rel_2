import { Logger } from '@nestjs/common';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderStatus } from '@prisma/client';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CustomsStatus } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { InvokeUpdateExitConfirmationCommand } from '../../commands/impl/invoke-updateexitconfirmation-method';
import { DfCheckpointFileReceivedEvent } from '../impl/df-checkpointfile-received.event';

@EventsHandler(DfCheckpointFileReceivedEvent)
export class DfCheckpointFileReceivedHandler
  implements IEventHandler<DfCheckpointFileReceivedEvent>
{
  constructor(
    private readonly repository: AggregateRepository,
    private readonly commandBus: CommandBus,
    private readonly viewService: ViewsService
  ) { }
  private logger = new Logger(this.constructor.name);
  async handle(event: DfCheckpointFileReceivedEvent): Promise<void> {
    this.logger.debug(JSON.stringify(event));

    const { aggregateId, checkpointFileData } = event;
    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId,
    );
    if (!orderAggregate) {
      throw Error('No orderaggregate found for orderId: ' + aggregateId);
    }

    if (orderAggregate.status !== OrderStatus.Submitted && orderAggregate.status !== OrderStatus.InTransit) {
      throw Error(`Orderaggregate ${orderAggregate.id} is not Submitted or In Transit`);
    }

    // Use the first found declarationNumber from the order
    const invoice = orderAggregate.order.invoices.find((i) => i.declarations);

    if (!invoice) {
      throw Error(
        `Orderaggregate ${orderAggregate.id} does not have an invoice with at least one declaration`,
      );
    }

    const declaration = invoice.declarations?.find((d) => d.declarationNumber);

    if (!declaration) {
      throw Error(
        `Invoice ${invoice.invoiceNumber} does not have a declaration`,
      );
    }

    await this.viewService.HydrateViews(orderAggregate);

    if (checkpointFileData.destination === 'AUH' ||
      checkpointFileData.destination === 'DXB' ||
      checkpointFileData.destination === 'SHJ') {
      this.logger.warn(`DF file did not invoke update exit due to destination being ${checkpointFileData.destination}`);
      return;
    }
    if (!invoice.FZCode) {
      this.logger.warn(`DF file did not invoke update exit due to invoke FZcode missing`);
      return;
    }
    if (declaration.clearanceStatus !== CustomsStatus.Cleared) {
      this.logger.warn(`DF file did not invoke update exit due to declaration clearance stance being ${declaration.clearanceStatus}`);
      return;
    }

    if (declaration.declarationType !== "303") {
      this.logger.warn(`DF file did not invoke update exit due to outbound request being ${declaration.declarationType}`);
      return;
    }

    this.logger.log(`DF file has cleared validations and will invoke update exit`);

    this.commandBus.execute(
      new InvokeUpdateExitConfirmationCommand(
        new OrderAggregateKey(orderAggregate.order.orderNumber, orderAggregate.order.ecomBusinessCode),
        orderAggregate.order.orderNumber,
        orderAggregate.order.ecomBusinessCode,
        invoice.invoiceNumber,
        declaration.declarationNumber,
      ),
    );
  }
}
