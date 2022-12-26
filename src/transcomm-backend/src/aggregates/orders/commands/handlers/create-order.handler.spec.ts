import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { Order } from 'core';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { CreateOrderCommand } from '../impl/create-order';
import { CreateOrderHandler } from './create-order.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('create order command handler', () => {
  let commandHandler: CreateOrderHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const newaggregate = Mock<OrderAggregate>();

  const mockPublisher = {
    mergeClassContext() { 
      return jest.fn().mockImplementation(() => { return newaggregate }) 
    }
  }

  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: StoreEventPublisher,
          useValue: mockPublisher,
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<CreateOrderHandler>(CreateOrderHandler);
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should create new order', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const mockOrder = Mock<Order>()
    mockOrder.actionDate = "";
    const command: CreateOrderCommand = {
      aggregateId: aggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };

    await commandHandler.execute(command);
    expect(newaggregate.submitOrder).toBeCalled();
  });

  it('should not create new order when one exists', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const mockOrder = Mock<Order>()
    mockOrder.actionDate = "";
    const command: CreateOrderCommand = {
      aggregateId: aggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };

    await commandHandler.execute(command);
    expect(aggregate.submitOrder).not.toBeCalled();
  });

  it('should not create new order when key missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const mockOrder = Mock<Order>()
    mockOrder.actionDate = "";
    const command: CreateOrderCommand = {
      aggregateId: {} as OrderAggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };
    command.aggregateId.key = () => '';

    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.submitOrder).not.toBeCalled();
  });
});
