import { Prisma } from '@prisma/client';
import {
  ConfirmReturnDelivery,
  LineItem,
  ModeType,
  selectMany,
  YesNo,
} from 'core';
import { OrderAggregate } from '../order-aggregate';

export class InvoiceView {
  HydrateInvoices(
    orderAggregate: OrderAggregate,
  ): Prisma.InvoiceCreateWithoutOrderInput[] {
    return orderAggregate.order.invoices.map((invoice) => {
      const {
        lineItems,
        FZCode,
        brokerBusinessCode,
        logisticsSPBusinessCode,
        documents,
        invoiceDate,
        associatedEcomCompany,
        returnDetail: returnDetails,
        locked,
        totalNoOfInvoicePages,
        totalValue,
        deliveryProviderBusinessCode,
        incoTerm,
        declarations,
        ...rest
      } = invoice;
      const lineItemsViews = this.HydrateLineItems(
        orderAggregate,
        lineItems,
      ).concat(
        this.HydrateReturnLineItems(orderAggregate, invoice.invoiceNumber),
      );
      const returnRequests = this.HydrateReceiptOfReturn(
        orderAggregate,
        invoice.invoiceNumber,
      );
      return {
        ...rest,
        invoiceNumber: invoice.invoiceNumber,
        totalNoOfInvoicePages: totalNoOfInvoicePages ?? 0,
        totalValue: invoice.totalValue ?? 0,
        incoTerm: invoice.incoTerm ?? '',
        locked: locked ?? false,
        invoiceDate: invoiceDate ? new Date(invoiceDate).toISOString() : null,
        fzCode: FZCode ? Number(FZCode) : undefined,
        orderLine: {
          createMany: {
            data: lineItemsViews,
          },
        },
        returnReceipts: {
          create: returnRequests,
        },
      };
    });
  }

  private HydrateLineItems(
    orderAggregate: OrderAggregate,
    lineItems: LineItem[],
  ): Prisma.OrderLineCreateWithoutInvoiceInput[] {
    const actionDate =
      orderAggregate.order.mode === ModeType.Cancel
        ? orderAggregate.orderCancelDate
        : orderAggregate.order.actionDate;
    return lineItems.map((line) => ({
      lineNumber: line.lineNo.toString(),
      actionDate: actionDate,
      mode: line.mode,
      quantity: line.quantity,
      quantityUOM: line.quantityUOM,
      netWeight: line.netWeight,
      netWeightUOM: line.netWeightUOM,
      description: line.description ?? '',
      hsCode: line.hscode,
      // dutyPaid: line.dutyPaid,
      countryOfOrigin: line.countryOfOrigin,
      discountValue: Number(line.discount?.value ?? 0),
      discountPercentage: Number(line.discount?.percentage ?? 0),
      unitPrice: line.valueOfGoods?.toString() ?? '',
      originalValueOfItem: line.originalValueOfItem ?? 0,
      isFreeOfCost: line.isFreeOfCost === YesNo.Yes ? true : false,
      goodsCondition: line.goodsCondition,
      supplementaryQuantity: line.supplementaryQuantity,
      supplementaryQuantityUOM: line.supplementaryQuantityUOM
        ? line.supplementaryQuantityUOM
        : '',
      prevDeclarationReference: line.prevDeclarationReference ?? '',
      skuProductCode: line.sku?.productCode ?? '',
      skuQuantityUOM: line.sku?.quantityUOM ?? '',
      itemLocation: line.sku?.itemLocation ?? '',  
      permit: line.sku?.permit ?? '',  
      total: line.quantity * line.valueOfGoods,
    }));
  }

  private HydrateReturnLineItems(
    aggregate: OrderAggregate,
    invoiceNumber: string,
  ): Prisma.OrderLineCreateWithoutInvoiceInput[] {
    const selectAllReturns = selectMany(aggregate.returns, (x) => x.returns);
    const filterRequests = selectAllReturns.filter(
      (x) => x.invoiceNumber === invoiceNumber,
    );
    const result: Prisma.OrderLineCreateWithoutInvoiceInput[] = [];
    for (const request of filterRequests) {
      for (const lineItem of request.lineItems) {
        result.push({
          lineNumber: lineItem.lineNo.toString(),
          mode: lineItem.mode,
          actionDate: lineItem.actionDate,
          quantity: lineItem.quantityReturned ?? 0, //should be quantityReturned
          quantityUOM: '',
          netWeight: 0,
          netWeightUOM: '',
          description: '',
          hsCode: '',
          dutyPaid: '',
          countryOfOrigin: '',
          discountValue: 0,
          discountPercentage: 0,
          unitPrice: '',
          originalValueOfItem: 0,
          isFreeOfCost: false,
          goodsCondition: '',
          supplementaryQuantity: 0,
          supplementaryQuantityUOM: '',
          prevDeclarationReference: '',
          skuProductCode: '',
          skuQuantityUOM: '',
          total: 0,
          returnRequestNumber: request.returnRequestNo,
        });
      }
    }
    return result;
  }

  private HydrateReceiptOfReturn(
    aggregate: OrderAggregate,
    invoiceNumber: string,
  ): Prisma.ReturnReceiptCreateWithoutInvoiceInput[] {
    const selectAllReturns = selectMany(aggregate.returns, (x) => x.returns);
    const filterRequests = selectAllReturns.filter(
      (x) => x.invoiceNumber === invoiceNumber,
    );
    const result: Prisma.ReturnReceiptCreateWithoutInvoiceInput[] = [];
    for (const request of filterRequests) {
      if (!request.confirmReturn) {
        continue;
      }
      const lines = this.HydrateReceiptOrderLines(request.confirmReturn);
      result.push({
        returnRequestNumber: request.confirmReturn.returnRequestNo,
        transportDocNo: request.confirmReturn.transportDocNo ?? '',
        transportProviderCode:
          request.confirmReturn.transportProviderCode ?? '',
        dateOfReceivingBackGoods:
          request.confirmReturn.dateOfReceivingBackGoods,
        gatePassNumber: request.confirmReturn.gatePasses
          ? request.confirmReturn.gatePasses[0].gatePassNumber
          : '',
        actualMovingInDate: request.confirmReturn.gatePasses
          ? request.confirmReturn.gatePasses[0].ActualMovingInDate
          : '',
        lineItems: { createMany: { data: lines } },
      });
    }
    return result;
  }

  private HydrateReceiptOrderLines(
    confirm: ConfirmReturnDelivery,
  ): Prisma.ReturnReceiptOrderLineCreateWithoutReturnReceiptInput[] {
    const { lineItems } = confirm;
    return lineItems.map((line) => ({
      lineNumber: line.lineNo,
      hsCode: line.hscode,
      skuProductCode: line.skuProductCode ?? '',
      receviedQuantity: line.receviedQuantity,
      isExtra: line.isExtra,
      quantityUOM: line.quantityUOM,
      goodsCondition: line.goodsCondition ?? '',
    }));
  }
}
