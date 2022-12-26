import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { Amendment, Invoice, Order } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { CreateAmendmentCommand } from '../impl/create-amendment';
import { CreateAmendmentCommandHandler } from './create-amendment.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('amendment command handler', () => {
  let commandHandler: CreateAmendmentCommandHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAmendmentCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());
    commandHandler = module.get<CreateAmendmentCommandHandler>(
      CreateAmendmentCommandHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit successfully', async () => {
    const invoiceNumber = 'test';
    const userId = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.locked = true;
    mockInvoice.lockedBy = userId;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: CreateAmendmentCommand = {
      aggregateId: aggregateKey,
      amendment: Mock<Amendment>(),
      userId: userId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: invoiceNumber,
      orderNumber: aggregateKey.orderId,
    };
    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.submitAmendment).toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });

  it('should error - wrong user', async () => {
    const invoiceNumber = 'test';
    const userId = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.locked = true;
    mockInvoice.lockedBy = userId;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: CreateAmendmentCommand = {
      aggregateId: aggregateKey,
      amendment: Mock<Amendment>(),
      userId: 'wrong',
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: invoiceNumber,
      orderNumber: aggregateKey.orderId,
    };

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.submitAmendment).not.toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
  });

  it('should error - not locked', async () => {
    const invoiceNumber = 'test';
    const userId = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.locked = false;
    mockInvoice.lockedBy = userId;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: CreateAmendmentCommand = {
      aggregateId: aggregateKey,
      amendment: Mock<Amendment>(),
      userId: userId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: invoiceNumber,
      orderNumber: aggregateKey.orderId,
    };

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.submitAmendment).not.toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
  });

  it('should error - missing invoice', async () => {
    const invoiceNumber = 'test';
    const userId = 'test';
    mockInvoice.invoiceNumber = 'wrong';
    mockInvoice.locked = false;
    mockInvoice.lockedBy = userId;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: CreateAmendmentCommand = {
      aggregateId: aggregateKey,
      amendment: Mock<Amendment>(),
      userId: userId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: invoiceNumber,
      orderNumber: aggregateKey.orderId,
    };

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.submitAmendment).not.toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
  });

  it('should error - aggregate missing', async () => {
    const invoiceNumber = 'test';
    const userId = 'test';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command: CreateAmendmentCommand = {
      aggregateId: aggregateKey,
      amendment: Mock<Amendment>(),
      userId: userId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: invoiceNumber,
      orderNumber: aggregateKey.orderId,
    };

    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregateRepo.getById).toBeCalled();
  });
});
