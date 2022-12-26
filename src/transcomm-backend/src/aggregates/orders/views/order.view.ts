import { Prisma } from "@prisma/client";
import { OrderAggregate } from "../order-aggregate";

export type orderDetailsParams = {
  invoices: Prisma.InvoiceCreateWithoutOrderInput[],
  addresses?: Prisma.AddressCreateWithoutOrderInput[],
  declarations?: Prisma.DeclarationCreateWithoutOrderInput[],
  delivered?: Prisma.DeliveredCreateWithoutOrderInput[],
  houseBills?: Prisma.HouseBillCreateWithoutOrderInput[],
  movements?: Prisma.MovementCreateWithoutOrderInput[],
  chainEvents?: Prisma.ChainEventCreateWithoutOrderInput[],
  errors?: Prisma.ErrorCreateWithoutOrderInput[],
};

export class OrderView {
  HydrateOrderDetails(
    orderAggregate: OrderAggregate,
    args: orderDetailsParams
  ): Prisma.OrderCreateInput {
    return {
      ecomBusinessCode: orderAggregate.ecomBusinessCode
        ? orderAggregate.ecomBusinessCode
        : '',
      orderNumber: orderAggregate.order.orderNumber,
      orderDate: orderAggregate.orderDate
        ? new Date(orderAggregate.orderDate)
        : null,
      status: orderAggregate.status,
      invoices: {
        create: args.invoices
      },
      addresses: {
        createMany: { data: args.addresses ?? [] }
      },
      declarations: {
        create: args.declarations
      },
      delivered: {
        createMany: { data: args.delivered ?? [] }
      },
      houseBills: {
        createMany: { data: args.houseBills ?? [] }
      },
      movements: {
        create: args.movements
      },
      eventChain: {
        create: args.chainEvents
      },
      Error: {
        createMany: { data: args.errors ?? [] }
      }
    };
  }
}
