import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import {
  ClaimRequestData,
  DeclarationJsonMappingData,
  DocumentTrackingData,
  DocumentType,
  InvoiceData,
  OrderData,
} from 'core';
import { AggregateRepository } from 'event-sourcing';
import { OrderAggregateKey } from '../../order-aggregate-key';
import { ProcessHyperledgerEventCommand } from '../impl/process-hl-event';

@CommandHandler(ProcessHyperledgerEventCommand)
export class ProcessHyperledgerEventHandler
  implements ICommandHandler<ProcessHyperledgerEventCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(command: ProcessHyperledgerEventCommand): Promise<void> {
    const {
      invoiceId,
      eventType,
      hyperledgerEvent,
      msgType,
      txnId,
      aggregateId,
    } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      this.logger.error(
        `No orderAggregate found for orderId:  ${aggregateId.key()}`,
      );
      throw Error(`No orderAggregate found for orderId:  ${aggregateId.key()}`);
    }

    switch (eventType) {
      case 'documenttracking': {
        const documentTrackingData = hyperledgerEvent as DocumentTrackingData;

        if (
          !this.matchInvoiceWithinOrderAggregate(
            orderAggregate,
            invoiceId,
            aggregateId,
          )
        ) {
          return;
        }

        if (documentTrackingData.documentType === DocumentType.Declaration) {
          orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
            documentTrackingData,
          );
        }

        if (documentTrackingData.documentType === DocumentType.Claim) {
          orderAggregate.processClaimDocumentTrackingDataProcessedEvent(
            documentTrackingData,
          );
        }
        break;
      }
      case 'order_data': {
        const orderData = hyperledgerEvent as OrderData;
        orderAggregate.processOrderDataProcessedEvent(
          orderData,
          msgType,
          txnId,
        );
        orderAggregate.commit();
        break;
      }
      case 'declaration_json_mapping': {
        const declarationJsonMappingData =
          hyperledgerEvent as DeclarationJsonMappingData;
        orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
          declarationJsonMappingData,
        );
        orderAggregate.commit();
        break;
      }
      case 'claim_request': {
        const claimRequestData = hyperledgerEvent as ClaimRequestData;
        orderAggregate.processClaimRequestDataProcessedEvent(claimRequestData);
        break;
      }
      case 'invoice_data': {
        const invoiceData = hyperledgerEvent as InvoiceData;
        if (
          !this.matchInvoiceWithinOrderAggregate(
            orderAggregate,
            invoiceId,
            aggregateId,
          )
        ) {
          return;
        }
        orderAggregate.processInvoiceDataProcessedEvent(invoiceId, invoiceData);
        break;
      }
      default:
        throw Error(`Unknown event type: ${eventType}`);
    }
    orderAggregate.commit();
  }

  private matchInvoiceWithinOrderAggregate(
    orderAggregate: OrderAggregate,
    invoiceId: string,
    aggregateId: OrderAggregateKey,
  ): boolean {
    if (
      !orderAggregate.order?.invoices?.find(
        (x) => x.invoiceNumber === invoiceId,
      )
    ) {
      this.logger.error(
        `Invoice: ${invoiceId} was not present within OrderAggregate ${aggregateId.key()}`,
      );
      orderAggregate.addErrorEvent(
        'ProcessHyperledgerEvent',
        '',
        `Invoice: ${invoiceId} was not present within OrderAggregate ${aggregateId.key()}`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return false;
    }
    return true;
  }
}
