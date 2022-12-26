import { Logger, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Order as PrismaOrder } from '@prisma/client';
import { OrderStatus, Paginated } from 'core';
import { OrderService } from 'database/order.service';
import Mock from 'jest-mock-extended/lib/Mock';
import { ExceptionOverviewDto } from './dto/exceptionOverview.dto';
import { OrderOverviewDto } from './dto/orderOverview.dto';
import { OrdersController } from './orders.controller';
import { UserRequest } from 'models/request.models';

const constantDate = new Date('2017-06-13T04:41:20');

describe('OrdersController', () => {
  let controller: OrdersController;
  let orderService: OrderService;

  beforeAll(async () => {
    // Provide a logger wihout output
    await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: {
            log: jest.fn(() => {
              return;
            }),
            error: jest.fn(() => {
              return;
            }),
          },
        },
      ],
    }).compile();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrderService,
          useValue: Mock<OrderService>(),
        },
        {
          provide: CommandBus,
          useValue: Mock<CommandBus>(),
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Orders with exceptions', () => {
    const mockException: Paginated<ExceptionOverviewDto> = {
      data: [
        {
          ecomCode: 'test',
          flightNumber: '',
          locked: false,
          mawb: '',
          rejectionDate: new Date(),
          batchId: '',
          declarationReference: '',
          declarationStatus: '',
          orderNumber: '',
          transport: '',
          orderDate: new Date(),
          invoiceNumber: 'test',
          lockedBy: 'barry',
        },
      ],
      numberOfRecords: 1,
    };

    it('should return a promise with a list of orders of type exception', async () => {
      jest
        .spyOn(orderService, 'ordersExceptionOverview')
        .mockImplementation(async () => mockException);
      const result = await controller.getOrderOverviewExceptions();
      return expect(result).toBe(mockException);
    });
  });

  describe('GetOrders', () => {
    const orderOverview: Paginated<OrderOverviewDto> = {
      data: [
        {
          orderNumber: 'test',
          ecomCode: 'test',
          orderDate: constantDate,
          orderStatus: OrderStatus.Submitted,
          declarationStatus: '',
          numberOfItems: 1,
          transport: '',
          invoiceNumber: 'test',
          declarationType: 'test',
          claimNumber: 'test',
          claimRequestDate: constantDate,
          claimStatus: 'test',
          claimType: 'test',
        },
      ],
      numberOfRecords: 1,
    };

    it('should return a promise with a list of orders', async () => {
      jest
        .spyOn(orderService, 'ordersOverview')
        .mockImplementation(async () => orderOverview);
      const result = await controller.getOrderOverview();
      return expect(result).toBe(orderOverview);
    });
  });

  describe('GetOrderById', () => {
    it('should return a promise with a order', async () => {
      const mockBaseOrder = Mock<PrismaOrder>();
      const mockOrder = {
        ...mockBaseOrder,
        invoices: [],
        addresses: [],
        eventChain: [],
        delivered: [],
        declarations: [],
        houseBills: [],
        movements: [],
      };
      jest.spyOn(orderService, 'order').mockResolvedValue(mockOrder);
      const result = await controller.getOrderWithInvoiceById(
        'test2',
        'test',
        'test',
      );
      return expect(result).toBe(mockOrder);
    });
    it('should return a NotFoundException when not found', async () => {
      jest.spyOn(orderService, 'order').mockImplementation(async () => null);
      return expect(
        controller.getOrderWithInvoiceById('test3', 'test', 'test'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('LockOrder', () => {
    it('should return a promise with a lock response', async () => {
      const mockUser = Mock<UserRequest>();
      const result = await controller.lockOrder(
        mockUser,
        'test',
        'test',
        'test',
      );
      return expect(result).toBeDefined();
    });
  });
});
