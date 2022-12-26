import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CustomsStatus, Invoice, Order, Declaration } from 'core';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { UpdateOrderCommand } from '../impl/update-order';
import { UpdateOrderHandler } from './update-order.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('update order command handler', () => {
  let commandHandler: UpdateOrderHandler;
  let aggregateRepo: AggregateRepository;
  let publisher: StoreEventPublisher;
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  const mockDeclaration = Mock<Declaration>();
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: StoreEventPublisher,
          useValue: Mock<StoreEventPublisher>(),
        },
      ],
    }).compile();

    commandHandler = module.get<UpdateOrderHandler>(UpdateOrderHandler);
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    publisher = module.get<StoreEventPublisher>(StoreEventPublisher);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should update an order', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    jest
      .spyOn(publisher, 'mergeClassContext')
      .mockImplementation(() => class extends OrderAggregate {});

    mockDeclaration.clearanceStatus = CustomsStatus.Rejected;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const command: UpdateOrderCommand = {
      aggregateId: aggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };

    await commandHandler.execute(command);
  });

  it('should not update order when key missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    mockDeclaration.clearanceStatus = CustomsStatus.Rejected;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const command: UpdateOrderCommand = {
      aggregateId: {} as OrderAggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };
    command.aggregateId.key = () => '';

    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.submitOrder).not.toBeCalled();
  });

  it('should not update order when aggregate cannot be found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    mockDeclaration.clearanceStatus = CustomsStatus.Rejected;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const command: UpdateOrderCommand = {
      aggregateId: aggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };
    command.aggregateId.key = () => '';

    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.submitOrder).not.toBeCalled();
  });

  it('should not update order when clearenceStatus is not Rejected', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    mockDeclaration.clearanceStatus = CustomsStatus.Declined;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const command: UpdateOrderCommand = {
      aggregateId: aggregateKey,
      order: mockOrder,
      orderNumber: aggregateKey.orderId,
    };
    command.aggregateId.key = () => '';

    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.submitOrder).not.toBeCalled();
  });
});
