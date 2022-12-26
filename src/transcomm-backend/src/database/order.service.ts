import { Injectable } from '@nestjs/common';
import {
  Order,
  Invoice,
  Prisma,
  Address,
  ChainEvent,
  Delivered,
  Declaration,
  HouseBill,
  Movement,
  OrderLine,
  ChainEventException,
  ReturnReceipt,
  ReturnReceiptOrderLine,
  DeclarationError,
} from '@prisma/client';
import { ManualRetryDTO } from 'aggregates/orders/dto/manualRetry.dto';
import { Paginated } from 'core';
import { CancelledOrderOverviewDto } from '../aggregates/orders/dto/cancelledOrderOverview.dto';
import { ExceptionOverviewDto } from '../aggregates/orders/dto/exceptionOverview.dto';
import { OrderOverviewDto } from '../aggregates/orders/dto/orderOverview.dto';
import { ReturnedOrderOverviewDto } from '../aggregates/orders/dto/returnedOrderOverview.dto';
import { DatabaseService } from './database.service';

type OrderIncludingAllNested = Order & {
  addresses: Address[];
  eventChain: (ChainEvent & {
    exceptions: ChainEventException[];
  })[];
  delivered: Delivered[];
  declarations: (Declaration & {
    errors: DeclarationError[]
  })[];
  houseBills: HouseBill[];
  movements: Movement[];
  invoices: (Invoice & {
    orderLine: OrderLine[];
    returnReceipts: (
      ReturnReceipt & {
        lineItems: ReturnReceiptOrderLine[]
      })[];
  })[];
};

@Injectable()
export class OrderService {
  constructor(private prisma: DatabaseService) { }

  async order(
    orderUniqueInput: Prisma.OrderWhereUniqueInput,
    invoiceNumber: string,
  ): Promise<OrderIncludingAllNested | null> {
    return this.prisma.order.findUnique({
      where: orderUniqueInput,
      include: {
        addresses: true,
        eventChain: {
          include: { exceptions: true },
        },
        delivered: true,
        declarations: {
          where: { invoiceNumber: { equals: invoiceNumber } },
          include: { claim: true, errors: true },
        },
        houseBills: true,
        movements: {
          include: { packageDetails: true, shippingDetails: true },
        },
        invoices: {
          where: { invoiceNumber: { equals: invoiceNumber } },
          include: {
            orderLine: true,
            returnReceipts: {
              include: { lineItems: true }
            }
          },
        },
      },
    });
  }

  async orders(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.OrderWhereUniqueInput;
    where?: Prisma.OrderWhereInput;
    orderBy?: Prisma.OrderOrderByInput;
  }): Promise<Order[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.order.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async ordersExceptionOverview(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.OrderExceptionOverviewWhereUniqueInput;
    where?: Prisma.OrderExceptionOverviewWhereInput;
    orderBy?:
    | Prisma.OrderExceptionOverviewOrderByInput
    | Prisma.OrderExceptionOverviewOrderByInput[];
  }): Promise<Paginated<ExceptionOverviewDto>> {
    const { skip, take, cursor, where, orderBy } = params;

    const transactionData = await this.prisma.$transaction([
      this.prisma.orderExceptionOverview.count({ where }),
      this.prisma.orderExceptionOverview.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      }),
    ]);
    return {
      data: transactionData[1],
      numberOfRecords: transactionData[0],
    };
  }

  async cancelledOrderOverviews(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CancelledOrderOverviewWhereUniqueInput;
    where?: Prisma.CancelledOrderOverviewWhereInput;
    orderBy?:
    | Prisma.CancelledOrderOverviewOrderByInput
    | Prisma.CancelledOrderOverviewOrderByInput[];
  }): Promise<Paginated<CancelledOrderOverviewDto>> {
    const { skip, take, cursor, where, orderBy } = params;

    const transactionData = await this.prisma.$transaction([
      this.prisma.cancelledOrderOverview.count({ where }),
      this.prisma.cancelledOrderOverview.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      }),
    ]);
    return {
      data: transactionData[1],
      numberOfRecords: transactionData[0],
    };
  }

  async returnedOrderOverviews(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ReturnedOrderOverviewWhereUniqueInput;
    where?: Prisma.ReturnedOrderOverviewWhereInput;
    orderBy?:
    | Prisma.ReturnedOrderOverviewOrderByInput
    | Prisma.ReturnedOrderOverviewOrderByInput[];
  }): Promise<Paginated<ReturnedOrderOverviewDto>> {
    const { skip, take, cursor, where, orderBy } = params;
    const transactionData = await this.prisma.$transaction([
      this.prisma.returnedOrderOverview.count({ where }),
      this.prisma.returnedOrderOverview.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      }),
    ]);
    return {
      data: transactionData[1],
      numberOfRecords: transactionData[0],
    };
  }

  async ordersOverview(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.OrderOverviewWhereUniqueInput;
    where?: Prisma.OrderOverviewWhereInput;
    orderBy?:
    | Prisma.OrderOverviewOrderByInput
    | Prisma.OrderOverviewOrderByInput[];
  }): Promise<Paginated<OrderOverviewDto>> {
    const { skip, take, cursor, where, orderBy } = params;

    const transactionData = await this.prisma.$transaction([
      this.prisma.orderOverview.count({ where }),
      this.prisma.orderOverview.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      }),
    ]);
    return {
      data: transactionData[1],
      numberOfRecords: transactionData[0],
    };
  }

  async manualRetries(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ManualRetryViewWhereUniqueInput;
    where?: Prisma.ManualRetryViewWhereInput;
    orderBy?:
    | Prisma.ManualRetryViewOrderByInput
    | Prisma.ManualRetryViewOrderByInput[];
  }): Promise<Paginated<ManualRetryDTO>> {
    const { skip, take, cursor, where, orderBy } = params;

    const transactionData = await this.prisma.$transaction([
      this.prisma.manualRetryView.count({ where }),
      this.prisma.manualRetryView.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      }),
    ]);
    return {
      data: transactionData[1],
      numberOfRecords: transactionData[0],
    };
  }

  async deleteManualRetries(data: Prisma.ManualRetryViewOrderNumberInvoiceNumberEcomCodeContractMethodCompoundUniqueInput[]): Promise<void> {

    const deleteRequests: Prisma.ManualRetryViewDeleteArgs[] = data.map(input => {
      return {
        where: {
          orderNumber_invoiceNumber_ecomCode_contractMethod: input
        },
      }
    })

    const deleteJobs = deleteRequests.map((deleteRequest) => {
      return this.prisma.manualRetryView.delete(deleteRequest);
    });

    await this.prisma.$transaction(deleteJobs);
  }

  async getInvoiceById(
    invoiceNumber: string,
    orderNumber: string,
    ecomBusinessCode: string,
  ): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: {
        invoiceNumber_orderNumber_ecomBusinessCode: {
          ecomBusinessCode,
          invoiceNumber,
          orderNumber,
        },
      },
    });
  }

  deleteOrder(where: Prisma.OrderWhereUniqueInput): Promise<Order> {
    return this.prisma.order.delete({
      where,
    });
  }

  async createOrder(data: Prisma.OrderCreateInput): Promise<Order> {
    return await this.prisma.order.create({
      data,
    });
  }
}
