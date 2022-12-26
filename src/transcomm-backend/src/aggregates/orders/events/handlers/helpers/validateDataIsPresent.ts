import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { CancelOrder, ModeType, ReturnOrder } from 'core';

export function ValidateDataIsPresent(
  methodName: string,
  orderAggregate: OrderAggregate,
  updatedOrder: CancelOrder | ReturnOrder,
): boolean {
  let outcome = true;
  updatedOrder.invoices.forEach((updatedInv) => {
    const existingInv = orderAggregate.order.invoices.find(
      (inv) => inv.invoiceNumber === updatedInv.invoiceNumber,
    );
    if (!existingInv) {
      outcome = false;
      orderAggregate.addErrorEvent(
        methodName,
        '2001065',
        `Error: Invoice with index: ${updatedInv.invoiceNumber}, not found in existing order: ${orderAggregate.id}`,
        new Date().toISOString(),
      );
    } else {
      if (updatedOrder.mode === ModeType.Return) {
        updatedInv.lineItems.forEach((lineItem) => {
          const existingLineItem = existingInv.lineItems.find(
            (l) => l.lineNo === lineItem.lineNo,
          );
          if (!existingLineItem) {
            outcome = false;
            orderAggregate.addErrorEvent(
              methodName,
              '2001059',
              `Error: Line item index ${lineItem.lineNo}, within Invoice with index: ${updatedInv.invoiceNumber}, not found inside the existing Order ${orderAggregate.id}`,
              new Date().toISOString(),
            );
          }
        });
      }
    }
  });

  orderAggregate.commit();

  return outcome;
}
