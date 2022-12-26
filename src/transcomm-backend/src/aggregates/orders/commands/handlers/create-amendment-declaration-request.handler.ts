import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import {
  Amendment,
  AmendmentOrderLine,
  DHLEDeclarationRequest,
  Direction,
  GoodsCondition,
  IncoTermCode,
} from 'core';
import { AggregateRepository } from 'event-sourcing';
import { CreateAmendmentFromDeclarationRequestCommand } from '../impl/create-amendment-declaration-request';

@CommandHandler(CreateAmendmentFromDeclarationRequestCommand)
export class CreateAmendmentFromDeclarationRequestCommandHandler
  implements ICommandHandler<CreateAmendmentFromDeclarationRequestCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(
    command: CreateAmendmentFromDeclarationRequestCommand,
  ): Promise<void> {
    const {
      orderNumber,
      ecomBusinessCode,
      invoiceNumber,
      aggregateId,
      airwayBillNumber,
    } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No orderaggregate found for aggregate id: ' + aggregateId.key(),
      );
    }

    const invoiceToAmend = orderAggregate.order?.invoices?.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );
    if (!invoiceToAmend) {
      this.logger.error(
        `Order ${aggregateId.key()} has no invoice with found with number: ${invoiceNumber}`,
      );
      orderAggregate.addErrorEvent(
        'CreateAmendment',
        '2001065',
        `Order ${aggregateId.key()} has no invoice with found with number: ${invoiceNumber}`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    let declarationRequest: DHLEDeclarationRequest | undefined;
    let returnRequestNumber: string | null = null;

    if (orderAggregate.direction === Direction.Return) {
      const indexOfReturn = orderAggregate.returns.findIndex(
        (x) => x.pickupFile?.hawb === airwayBillNumber,
      );
      if (indexOfReturn >= 0) {
        declarationRequest =
          orderAggregate.returns[indexOfReturn].declarationRequest;
        const returnInvoiceData = orderAggregate.returns[
          indexOfReturn
        ].request.invoices.find((x) => x.invoiceNumber === invoiceNumber);
        returnRequestNumber =
          returnInvoiceData?.returnDetail.returnRequestNo ?? null;
      }
    } else {
      declarationRequest = orderAggregate.declarationRequest;
    }

    const invoiceData =
      declarationRequest?.Declaration.Consignments.ShippingDetails.Invoices.find(
        (x) => x.InvoiceNumber === invoiceNumber,
      );

    if (!invoiceData) {
      const errorMessage = `Order ${aggregateId.key()} declaration request has no invoice with with number: ${invoiceNumber}`;
      this.logger.error(errorMessage);
      orderAggregate.addErrorEvent(
        'CreateAmendment',
        '2001065',
        errorMessage,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    const orderLines: AmendmentOrderLine[] = invoiceData.InvoiceItemsDetail.map(
      (orderLine) => {
        return {
          lineNumber: orderLine.InvoiceItemLineNumber,
          commodityCode: orderLine.CommodityCode,
          goodsCondition: orderLine.GoodsCondition as GoodsCondition,
          description: orderLine.GoodsDescription,
          quantity: orderLine.StatisticalQuantity,
          quantityUnit: orderLine.StatisticalQuantityMeasurementUnit,
          weight: orderLine.NetWeight,
          weightUnit: orderLine.NetWeightUnit,
          total: orderLine.ValueOfGoods,
          supplQuantityUnit: orderLine.SupplementaryQuantityMeasurementUnit,
        };
      },
    );

    const amendment: Amendment = {
      ecomBusinessCode: ecomBusinessCode,
      orderNumber: orderNumber,
      invoiceNumber: invoiceNumber,
      incoTerm: invoiceData.INCOTermsCode as IncoTermCode,
      totalNoOfInvoicePages: invoiceData.TotalNumberOfInvoicePages,
      invoiceDate: invoiceData.InvoiceDate,
      orderLines: orderLines,
    };

    orderAggregate.submitAmendment(
      ecomBusinessCode,
      invoiceNumber,
      amendment,
      returnRequestNumber,
    );
    orderAggregate.commit();
  }
}
