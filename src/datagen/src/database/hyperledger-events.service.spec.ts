import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { HyperledgerEventsService } from './hyperledger-events.service';
import {
  EventStatus,
  HyperledgerEvent,
  Prisma,
  PrismaClient,
  TxnLookup,
} from '@prisma/client';
import { MockProxy, mockDeep } from 'jest-mock-extended';
import { HyperledgerEventNames } from 'hyperledger/constants/hyperledger-events';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: MockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

const mockId = '1';

const mockHLEvent: HyperledgerEvent = {
  id: mockId,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: EventStatus.OPEN,
  key: 'testKey',
  collection: 'testCollection',
  blockNumber: 1,
  invoiceNumber: '1',
  orderNumber: '1',
  ecomCode: 'testEcom',
  eventName: HyperledgerEventNames.chain,
  txId: '500',
};

const mockTxnLookup: TxnLookup = {
  txnId: mockId,
  createdAt: new Date(),
  updatedAt: new Date(),
  orderNumber: '1',
  invoiceNumber: '2',
  eventType: 'submitOrder',
  ecomCode: 'testEcom',
};

describe('OrderService', () => {
  let service: HyperledgerEventsService;
  let context: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    context = createMockContext();
    ctx = context as unknown as Context;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DatabaseService, useValue: ctx.prisma },
        HyperledgerEventsService,
      ],
    }).compile();

    service = module.get<HyperledgerEventsService>(HyperledgerEventsService);
  });

  it('should be defined', () => {
    return expect(service).toBeDefined();
  });

  it('Creates HyperledgerEvent', async () => {
    const mockHLRequest: Prisma.HyperledgerEventCreateInput = {
      status: EventStatus.OPEN,
      key: 'testKey',
      collection: 'testCollection',
      blockNumber: 1,
      invoiceNumber: '1',
      orderNumber: '1',
      ecomCode: 'testEcom',
      eventName: HyperledgerEventNames.chain,
      txId: '500',
    };
    context.prisma.hyperledgerEvent.create.mockResolvedValue(mockHLEvent);
    const result = await service.createHyperledgerEvent(mockHLRequest);
    return expect(result).toEqual(mockHLEvent);
  });

  it('Creates TxnLookup', async () => {
    const mockTxnRequest: Prisma.TxnLookupCreateInput = {
      txnId: '1',
      orderNumber: '1',
      eventType: 'invokeSubmitOrder',
      ecomCode: 'testEcom',
    };

    context.prisma.txnLookup.create.mockResolvedValue(mockTxnLookup);
    const result = await service.createTxnLookup(mockTxnRequest);
    return expect(result).toEqual(mockTxnLookup);
  });

  it('Find by id returns expected', async () => {
    context.prisma.txnLookup.findUnique.mockResolvedValue(mockTxnLookup);
    const result = await service.getTxnId('1');
    return expect(result).toEqual(mockTxnLookup);
  });

  it('Find hlEvent by key returns expected', async () => {
    context.prisma.hyperledgerEvent.findFirst.mockResolvedValue(mockHLEvent);
    const result = await service.getHyperledgerEventByKey('1');
    return expect(result).toEqual(mockHLEvent);
  });
});
