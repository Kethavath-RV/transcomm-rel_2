import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { Invoice, Order, UserResponse } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { UnlockOrderCommand } from '../impl/unlock-order';
import { UnlockOrderCommandHandler } from './unlock-order.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('unlock order handler', () => {
  let commandHandler: UnlockOrderCommandHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();

  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnlockOrderCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<UnlockOrderCommandHandler>(
      UnlockOrderCommandHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit without errors', async () => {
    const locker = "me";
    mockInvoice.lockedBy = locker;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const user: UserResponse = {
      id: '',
      email: locker,
      firstName: '',
      lastName: '',
      role: 'viewer',
      locked: false
    }
    const command: UnlockOrderCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      invoiceNumber: mockInvoice.invoiceNumber,
      user: user
    };
    await commandHandler.execute(command);

    expect(aggregate.unlockOrder).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error if locker is not the user', async () => {
    mockInvoice.lockedBy = "notme";
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const user: UserResponse = {
      id: '',
      email: "me",
      firstName: '',
      lastName: '',
      role: 'viewer',
      locked: false
    }
    const command: UnlockOrderCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      invoiceNumber: mockInvoice.invoiceNumber,
      user: user
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.unlockOrder).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });

  it('should throw error when the aggregateId is empty', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const user: UserResponse = {
      id: '',
      email: 'test@test.nl',
      firstName: '',
      lastName: '',
      role: 'viewer',
      locked: false
    }
    const command: UnlockOrderCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderNumber: aggregateKey.orderId,
      invoiceNumber: '',
      user: user
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.unlockOrder).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
