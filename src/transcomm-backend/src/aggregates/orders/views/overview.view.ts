import { Prisma } from "@prisma/client";
import { declarationType, Order, OrderStatus, ReturnReasonUi } from "core";
import { OrderAggregate } from "../order-aggregate";

export class OverviewView {

  HydrateOrderOverviews(
    order: Order,
    aggregate: OrderAggregate
  ): Prisma.OrderOverviewCreateInput[] {
    return order.invoices.map((x) => {
      const declaration = x.declarations?.find(existingDeclaration => existingDeclaration);
      return {
        orderNumber: order.orderNumber,
        invoiceNumber: x.invoiceNumber,
        ecomCode: order.ecomBusinessCode,
        orderStatus: aggregate.status,
        orderDate: order.orderDate ?? null,
        lastActionDate: aggregate.lastActionDate,
        transport: aggregate.pickupFile?.hawb ?? '',
        numberOfItems: x.lineItems.length, //might be checkpoint file number of packages.
        declarationStatus: declaration ? declaration.clearanceStatus : '',
        declarationType: declaration ? declaration.declarationType : '',
        claimNumber: declaration?.claim ? declaration.claim.nrClaimNumber : '',
        claimRequestDate: declaration?.claim ? new Date(declaration.claim.requestDate).toISOString() : null,
        claimStatus: declaration?.claim ? declaration.claim.claimStatus : '',
        claimType: declaration?.claim ? declaration.claim.claimType : '',
        declarationNumber: declaration?.declarationNumber,
        batchId: declaration?.batchId
      }
    });
  }

  HydrateReturnOverviews(
    aggregate: OrderAggregate
  ): Prisma.ReturnedOrderOverviewCreateInput[] {
    if (aggregate.returns.length === 0)
      return [];

    const overviews: Prisma.ReturnedOrderOverviewCreateInput[] = [];

    for (const returnRequest of aggregate.returns) {
      for (const details of returnRequest.returns) {
        let numberOfItems = 0;
        details.lineItems.forEach(
          (lineItem) => (numberOfItems += lineItem?.quantityReturned ?? 0),
        );
        const invoice = aggregate.order.invoices.find(x => x.invoiceNumber === details.invoiceNumber);
        const latestDecl = invoice?.declarations?.find(decl => decl.returnRequestNo === details.returnRequestNo)
        const toAdd = {
          orderNumber: aggregate.order.orderNumber,
          ecomCode: aggregate.order.ecomBusinessCode,
          invoiceNumber: details.invoiceNumber,
          orderDate: aggregate.orderDate ?? null,
          lastActionDate: aggregate.lastActionDate,
          returnDate: returnRequest.actionDate,
          numberOfReturnItems: numberOfItems,
          returnReason: details.returnReason && !isNaN(Number(details.returnReason)) ? ReturnReasonUi[Number(details.returnReason)] : '',
          declarationNumber: latestDecl?.declarationNumber,
          batchId: latestDecl?.batchId,
          declarationStatus: latestDecl?.clearanceStatus,
          declarationType: latestDecl?.declarationType,
          declarationPurposeDetails: details?.declarationPurposeDetails ?? '',
          returnRequestNo: details?.returnRequestNo ?? '',
          prevTransportDocNo: details?.prevTransportDocNo ?? '',
          returnJustification: details?.returnJustification ?? '',
        }
        const existing = overviews.findIndex(x => x.invoiceNumber === details.invoiceNumber);
        if (existing !== -1) {
          overviews[existing] = toAdd;
        }
        else {
          overviews.push(toAdd);
        }

      }
    }
    return overviews;
  }

  HydrateCancelOrderOverviews(
    aggregate: OrderAggregate,
    order: Order
  ): Prisma.CancelledOrderOverviewCreateInput[] {

    if (aggregate.status !== OrderStatus.OrderCancelled)
      return []

    return order.invoices.map(invoice => {
      let numberOfItems = 0;
      invoice.lineItems.forEach(
        (lineItem) => (numberOfItems += lineItem.quantity),
      );

      return {
        orderNumber: order.orderNumber,
        invoiceNumber: invoice.invoiceNumber,
        cancellationReason: invoice.cancellationReason ?? '',
        ecomCode: order.ecomBusinessCode,
        orderDate: order.orderDate,
        lastActionDate: aggregate.lastActionDate,
        numberOfItems: numberOfItems,
        cancelDate: aggregate.orderCancelDate,
      }
    });
  }

  HydrateExceptionOverview(
    order: Order,
    aggregate: OrderAggregate,
    declarations?: Prisma.DeclarationCreateWithoutOrderInput[]
  ): Prisma.OrderExceptionOverviewCreateInput[] {
    const result: Prisma.OrderExceptionOverviewCreateInput[] = [];
    if (!declarations)
      return result;

    for (const declaration of declarations) {
      {
        const invoice = order.invoices.find(x => x.invoiceNumber === declaration.invoiceNumber);
        if ((declaration.clearanceStatus === declarationType["16"] || declaration.clearanceStatus === declarationType["500"]) && invoice) {
          result.push(
            {
              orderNumber: order.orderNumber,
              orderDate: order.orderDate ?? "",
              lastActionDate: aggregate.lastActionDate,
              invoiceNumber: declaration.invoiceNumber,
              ecomCode: order.ecomBusinessCode,
              locked: invoice?.locked ?? false,
              lockedBy: invoice?.lockedBy ?? '',
              declarationReference: declaration.declarationNumber,
              batchId: declaration.batchId ?? '',
              rejectionDate: new Date().toISOString(), //TODO add last activity date.
              transport: '', //TODO Verify always been blank
              declarationStatus: declaration.clearanceStatus,
              flightNumber: "", //airwayBillNumber if outbound movement.airwayBillNumber else from the return
              mawb: "", //mawb if outbound movement else from the return.
            }
          );
        }
      }
    }
    return result;
  }
}
