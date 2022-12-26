import { Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { OrderAggregate } from "aggregates/orders/order-aggregate";
import { ContractMethod } from "core";
import { DatabaseService } from "database/database.service";
import { AggregateRepository } from "event-sourcing";
import { InvokeCancelOrderMethodCommand } from "../impl/invoke-cancelorder-method";
import { InvokeConfirmReturnDeliveryMethodCommand } from "../impl/invoke-confirmreturndelivery-method";
import { InvokeDeliverOrderMethodCommand } from "../impl/invoke-deliverorder-method";
import { InvokeInitiateDeclarationCallMethodCommand } from "../impl/invoke-initiatedeclarationcall-method";
import { InvokeReturnDeliverOrderMethodCommand } from "../impl/invoke-return-deliverorder-method";
import { InvokeReturnUpdateTransportInfoMethodCommand } from "../impl/invoke-return-updatetransportinfo-method";
import { InvokeReturnOrderMethodCommand } from "../impl/invoke-returnorder-method";
import { InvokeSubmitOrderMethodCommand } from "../impl/invoke-submitorder-method";
import { InvokeSubmitOrderMethodForAmendmentCommand } from "../impl/invoke-submitorder-method-for-amendment";
import { InvokeSubmitOrderModeFinalMethodCommand } from "../impl/invoke-submitordermodefinal-method";
import { InvokeUpdateExitConfirmationCommand } from "../impl/invoke-updateexitconfirmation-method";
import { InvokeUpdateTransportInfoMethodCommand } from "../impl/invoke-updatetransportinfo-method";
import { InvokeUpdateTransportInfoMethodForAmendmentCommand } from "../impl/invoke-updatetransportinfo-method-for-amendment";
import { RetryHyperledgerCommand } from "../impl/retry-hyperledger";

@CommandHandler(RetryHyperledgerCommand)
export class RetryHyperledgerHandler
  implements ICommandHandler<RetryHyperledgerCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly prisma: DatabaseService,
    private readonly commandBus: CommandBus,
  ) { }

  async execute(command: RetryHyperledgerCommand): Promise<void> {
    const { aggregateId, contractMethod, vcId, username, remark } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No order aggregate found for aggregate id: ' + aggregateId.key(),
      );
    }

    if (
      (contractMethod === ContractMethod.SubmitOrderModeBasic &&
        orderAggregate.submitOrderMethodInvoked) || // Add specific boolean there for mode basic
      (contractMethod === ContractMethod.SubmitOrderModeFinal &&
        orderAggregate.submitOrderMethodInvoked) ||
      (contractMethod === ContractMethod.UpdateTransportInfo &&
        orderAggregate.updateTransportInfoMethodInvoked) ||
      (contractMethod === ContractMethod.InitiateDeclaration &&
        orderAggregate.initiateDeclarationcallMethodInvoked) ||
      (contractMethod === ContractMethod.ConfirmReturnDelivery &&
        orderAggregate.confirmReturnDeliveryMethodInvoked) ||
      (contractMethod === ContractMethod.DeliverOrder &&
        orderAggregate.deliverOrderMethodInvoked) ||
      (contractMethod === ContractMethod.UpdateExitConfirmation &&
        orderAggregate.updateExitConfirmationMethodInvoked)
    ) {
      this.logger.log(
        `Hyperledger call ${contractMethod} for order: ${command.orderNumber} has already been successfully made`,
      );

      // Updating the manual retry view model so that the retry button will be disabled since the call is not needed to be retried
      this.prisma.manualRetryView.update({
        data: {
          retryButton: false,
          status: 'closed',
          remark: remark,
        },
        where: {
          orderNumber_invoiceNumber_ecomCode_contractMethod: {
            orderNumber: command.orderNumber,
            ecomCode: command.ecomCode,
            invoiceNumber: command.invoiceId,
            contractMethod: contractMethod,
          },
        },
      });
      return;
    }

    switch (contractMethod) {
      case ContractMethod.SubmitOrderModeBasic:
        this.commandBus.execute(
          new InvokeSubmitOrderMethodCommand(
            aggregateId,
            command.orderNumber,
            command.ecomCode,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.SubmitOrderModeFinal:
        this.commandBus.execute(
          new InvokeSubmitOrderModeFinalMethodCommand(
            aggregateId,
            command.orderNumber,
            command.ecomCode,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.SubmitOrderModeUpdate:
        this.commandBus.execute(
          new InvokeSubmitOrderMethodForAmendmentCommand(
            aggregateId,
            command.orderNumber,
            command.invoiceId,
            command.ecomCode,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.UpdateTransportInfo:
        this.commandBus.execute(
          new InvokeUpdateTransportInfoMethodCommand(aggregateId, username),
        );
        break;
      case ContractMethod.UpdateTransportInfoModeUpdate:
        this.commandBus.execute(
          new InvokeUpdateTransportInfoMethodForAmendmentCommand(
            aggregateId,
            command.orderNumber,
            command.ecomCode,
            command.invoiceId,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.InitiateDeclaration:
        this.commandBus.execute(
          new InvokeInitiateDeclarationCallMethodCommand(
            aggregateId,
            command.orderNumber,
            command.invoiceId,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.ConfirmReturnDelivery:
        this.commandBus.execute(
          new InvokeConfirmReturnDeliveryMethodCommand(
            aggregateId,
            command.orderNumber,
            command.ecomCode,
            command.invoiceId,
            vcId,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.DeliverOrder:
        this.commandBus.execute(
          new InvokeDeliverOrderMethodCommand(
            aggregateId,
            command.orderNumber,
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.DeliverOrderModeReturn:
        this.commandBus.execute(new InvokeReturnDeliverOrderMethodCommand(aggregateId, vcId, username));
        break;
      case ContractMethod.SubmitOrderModeReturn:
        this.commandBus.execute(new InvokeReturnOrderMethodCommand(aggregateId, vcId, username));
        break;
      case ContractMethod.SubmitOrderModeCancel:
        this.commandBus.execute(new InvokeCancelOrderMethodCommand(aggregateId, vcId, username));
        break;
      case ContractMethod.UpdateExitConfirmation:
        this.commandBus.execute(
          new InvokeUpdateExitConfirmationCommand(
            aggregateId,
            command.orderNumber,
            command.ecomCode,
            command.invoiceId,
            this.getDeclarationNumber(orderAggregate),
            username,
            remark,
          ),
        );
        break;
      case ContractMethod.UpdateTransportInfoModeReturn:
        this.commandBus.execute(new InvokeReturnUpdateTransportInfoMethodCommand(aggregateId, vcId, username));
        break;
      default:
        this.logger.log(
          `Retrying of contract method: ${contractMethod} not implemented`,
        );
    }
  }

  private getDeclarationNumber(orderAggregate: OrderAggregate): string {
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

    return declaration.declarationNumber;
  }
}
