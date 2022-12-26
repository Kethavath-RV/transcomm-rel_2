import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { OrderService } from './order.service';
import { Order, Prisma, PrismaClient } from '@prisma/client';
import { MockProxy, mockDeep } from 'jest-mock-extended';

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

const mockOrderNumber = 'test1';
const mockEcomNumber = 'test1';

const mockOrder: Order = {
  lastActionDate: new Date(),
  ecomBusinessCode: 'test',
  actionDate: new Date(),
  consigneeName: 'test',
  eCommBusinessName: mockEcomNumber,
  orderNumber: mockOrderNumber,
  status: 'test',
  orderDate: new Date(),
};

const mockOrderWhereInput: Prisma.OrderWhereUniqueInput = {
  orderNumber_ecomBusinessCode: {
    orderNumber: mockOrderNumber,
    ecomBusinessCode: mockEcomNumber,
  },
};

describe('OrderService', () => {
  let service: OrderService;
  let context: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    context = createMockContext();
    ctx = context as unknown as Context;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DatabaseService, useValue: ctx.prisma },
        OrderService,
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    return expect(service).toBeDefined();
  });

  it('Creates Order', async () => {
    const mockOrderRequest: Prisma.OrderCreateInput = {
      ecomBusinessCode: 'test',
      orderNumber: 'test',
      status: 'test',
      orderDate: new Date(2021, 7, 1),
    };
    context.prisma.order.create.mockResolvedValue(mockOrder);
    const result = await service.createOrder(mockOrderRequest);
    return expect(result).toEqual(mockOrder);
  });

  it('Deletes an Order and its assoications', async () => {
    context.prisma.order.delete.mockResolvedValue(mockOrder);
    const result = await service.deleteOrder(mockOrderWhereInput);
    return expect(result).toEqual(mockOrder);
  });

  it('If a Delete fails they all fail', async () => {
    context.prisma.order.delete.mockRejectedValue(new Error('failed'));
    await expect(
      service.deleteOrder(mockOrderWhereInput),
    ).rejects.toThrowError();
  });

  it('Find by id returns expected', async () => {
    context.prisma.order.findUnique.mockResolvedValue(mockOrder);
    const result = await service.order(mockOrderWhereInput, '');
    return expect(result).toEqual(mockOrder);
  });
});
