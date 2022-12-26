import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'app.module';
import { Order, OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import { DatabaseService } from 'database/database.service';
import {
  Currencies,
  IncoTermCode,
  InvoiceType,
  PaymentInstrumentType,
} from 'core';
import testEnvironment from './test.env';
import { ConfigModule } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let previousNodeEnv;
  let app: INestApplication;
  let database: PrismaClient;

  const mockOrderNumber = 'test1';
  const mockOrder: Order = {
    lastActionDate: new Date(),
    ecomBusinessCode: 'test',
    actionDate: new Date(),
    eCommBusinessName: 'test',
    consigneeName: 'test',
    orderNumber: mockOrderNumber,
    status: 'test',
    orderDate: new Date(),
  };
  const mockOrderOverview = {
    declarationStatus: 'test',
    ecomCode: 'test',
    invoiceNumber: 'test',
    numberOfItems: 2,
    orderDate: new Date(),
    orderStatus: OrderStatus.Submitted,
    declarationType: 'test',
    claimNumber: 'test',
    claimRequestDate: new Date(),
    claimStatus: 'test',
    claimType: 'test',
    transport: 'train',
  };

  const mockInvoice: Prisma.InvoiceCreateWithoutOrderInput = {
    invoiceNumber: 'test',
    mode: "F",
    invoiceDate: new Date(),
    totalNoOfInvoicePages: 4,
    invoiceType: InvoiceType.DeliveryInvoice,
    paymentInstrumentType: PaymentInstrumentType.Cash,
    currency: Currencies.UsDollar,
    totalValue: Number(40.32),
    incoTerm: IncoTermCode.CostInsuranceFreight,
    locked: false,
  };

  beforeAll(async () => {
    previousNodeEnv = process.env;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          load: [testEnvironment],
        }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    database = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    // jest.resetModules();
    // process.env = { ...}
    //wipe db
    await database.order.deleteMany();
    await database.orderOverview.deleteMany();
  });

  afterAll(async () => {
    () => (process.env.NODE_ENV = previousNodeEnv);
    await app.close();
  });

  describe('getOrder', () => {
    it('/ (GET)', async () => {
      await database.order.create({
        data: mockOrder,
      });
      await database.invoice.create({
        data: {
          ...mockInvoice,
          order: {
            connect: {
              orderNumber_ecomBusinessCode: {
                orderNumber: mockOrder.orderNumber,
                ecomBusinessCode: mockOrder.ecomBusinessCode,
              },
            },
          },
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/api/orders/${mockOrder.orderNumber}/${mockInvoice.invoiceNumber}`,
      );
      return expect(response.status).toBe(200);
    });
  });

  describe('findOrder', () => {
    it('GetOrderOverview', async () => {
      await database.orderOverview.createMany({
        data: [
          {
            ...mockOrderOverview,
            orderNumber: 'test1',
          },
          {
            ...mockOrderOverview,
            orderNumber: 'test2',
          },
        ],
      });
      const query: Prisma.OrderOverviewWhereInput = {
        orderNumber: {
          contains: 'test1',
        },
      };
      const response = await request(app.getHttpServer())
        .post(`/api/orders/overview`)
        .send(query);
      expect(response.status).toBe(200);
      return expect(response.body.length).toBe(1);
    });
  });
});
