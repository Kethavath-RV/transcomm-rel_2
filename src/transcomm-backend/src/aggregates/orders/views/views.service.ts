import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Order } from 'core';
import { DatabaseService } from 'database/database.service';
import { OrderAggregate } from '../order-aggregate';
import { AddressView } from './address.view';
import { ChainEventView } from './chain-event.view';
import { DeclarationView } from './declaration.view';
import { InvoiceView } from './invoice.view';
import { MovementView } from './movement.view';
import { orderDetailsParams, OrderView } from './order.view';
import { OverviewView } from './overview.view';

@Injectable()
export class ViewsService {
  private movementHydrator: MovementView;
  private invoiceHydrator: InvoiceView;
  private addressHydrator: AddressView;
  private declarationHydrator: DeclarationView;
  private orderHydrator: OrderView;
  private overviewHydrator: OverviewView;
  private chainEventHydrator: ChainEventView;

  constructor(private readonly prisma: DatabaseService) {
    this.movementHydrator = new MovementView();
    this.invoiceHydrator = new InvoiceView();
    this.addressHydrator = new AddressView();
    this.declarationHydrator = new DeclarationView();
    this.orderHydrator = new OrderView();
    this.overviewHydrator = new OverviewView();
    this.chainEventHydrator = new ChainEventView();
  }

  private logger = new Logger(this.constructor.name);

  HydrateViews(aggregate: OrderAggregate) {
    const { order } = aggregate;
    this.logger.log(
      `Hydrating views: ${order.orderNumber} - ${order.ecomBusinessCode}`,
    );

    //nested views
    const orderOptions: orderDetailsParams = {
      invoices: this.invoiceHydrator.HydrateInvoices(aggregate),
      houseBills: aggregate.houseBills,
      movements: this.movementHydrator.HydrateMovements(aggregate),
      addresses: this.addressHydrator.HydrateAddresses(aggregate),
      declarations: this.declarationHydrator.HydrateDeclarations(order),
      delivered: this.HydrateDeliveredFiles(aggregate),
      chainEvents: this.chainEventHydrator.HydrateChainEvents(aggregate),
      errors: this.HydrateErrors(aggregate),
    };

    //order details
    const orderView = this.orderHydrator.HydrateOrderDetails(
      aggregate,
      orderOptions,
    );

    //Overviews
    const overviews = this.overviewHydrator.HydrateOrderOverviews(
      order,
      aggregate,
    );
    const returnOverviews =
      this.overviewHydrator.HydrateReturnOverviews(aggregate);
    const exceptionOverview = this.overviewHydrator.HydrateExceptionOverview(
      order,
      aggregate,
      orderOptions.declarations,
    );
    const cancelledOverviews =
      this.overviewHydrator.HydrateCancelOrderOverviews(aggregate, order);

    //main transaction
    return this.prisma.$transaction([
      this.DeleteExisting(order),
      this.CreateOrderView(orderView),
      this.DeleteOverviews(order),
      this.CreateOrderOverviews(overviews),
      this.DeleteReturnOverviews(order),
      this.CreateOrderReturnOverviews(returnOverviews),
      this.DeleteExceptionOverviews(order),
      this.CreateOrderExceptionOverviews(exceptionOverview),
      this.DeleteCancelledOverviews(order),
      this.CreateCancelledOverviews(cancelledOverviews),
    ]);
  }

  //Transaction commands

  private DeleteExisting(order: Order) {
    return this.prisma.order.deleteMany({
      where: {
        ecomBusinessCode: order.ecomBusinessCode,
        orderNumber: order.orderNumber,
      },
    });
  }

  private CreateOrderView(prismaQuery: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data: prismaQuery,
    });
  }

  private DeleteOverviews(order: Order) {
    return this.prisma.orderOverview.deleteMany({
      where: {
        orderNumber: order.orderNumber,
        ecomCode: order.ecomBusinessCode,
      },
    });
  }

  private CreateOrderOverviews(overviews: Prisma.OrderOverviewCreateInput[]) {
    return this.prisma.orderOverview.createMany({
      data: overviews,
    });
  }

  private DeleteReturnOverviews(order: Order) {
    return this.prisma.returnedOrderOverview.deleteMany({
      where: {
        orderNumber: order.orderNumber,
        ecomCode: order.ecomBusinessCode,
      },
    });
  }

  private CreateOrderReturnOverviews(
    overviews: Prisma.ReturnedOrderOverviewCreateInput[],
  ) {
    return this.prisma.returnedOrderOverview.createMany({
      data: overviews,
    });
  }

  private DeleteExceptionOverviews(order: Order) {
    return this.prisma.orderExceptionOverview.deleteMany({
      where: {
        orderNumber: order.orderNumber,
        ecomCode: order.ecomBusinessCode,
      },
    });
  }

  private CreateOrderExceptionOverviews(
    overviews: Prisma.OrderExceptionOverviewCreateManyInput[],
  ) {
    return this.prisma.orderExceptionOverview.createMany({
      data: overviews,
    });
  }

  private DeleteCancelledOverviews(order: Order) {
    return this.prisma.cancelledOrderOverview.deleteMany({
      where: {
        orderNumber: order.orderNumber,
        ecomCode: order.ecomBusinessCode,
      },
    });
  }

  private CreateCancelledOverviews(
    overviews: Prisma.CancelledOrderOverviewCreateManyInput[],
  ) {
    return this.prisma.cancelledOrderOverview.createMany({
      data: overviews,
    });
  }

  //Delivery + Undelivered + DF
  private HydrateDeliveredFiles(
    aggregate: OrderAggregate,
  ): Prisma.DeliveredCreateWithoutOrderInput[] {
    return aggregate.delivered.map((delivered) => ({
      ...delivered,
    }));
  }

  private HydrateErrors(
    aggregate: OrderAggregate,
  ): Prisma.ErrorCreateWithoutOrderInput[] {
    return aggregate.errorEvents.map((x) => ({
      vcId: x.vcId,
      errorType: x.errorCode,
      errorMessage: x.errorMessage,
      errorTime: new Date(x.errorTime),
    }));
  }
}
