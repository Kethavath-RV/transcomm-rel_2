import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Amendment, Invoice, Order } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { AmendmentCreatedEvent } from '../impl/amendment-created.event';
import { AmendmentCreatedEventHandler } from './amendment-created.handler';

describe('amendment event handler', () => {
  let eventHandler: AmendmentCreatedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();




  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmendmentCreatedEventHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        },
        {
          provide: CommandBus,
          useValue: Mock<CommandBus>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());


    eventHandler = module.get<AmendmentCreatedEventHandler>(
      AmendmentCreatedEventHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(
      AggregateRepository
    );
    viewService = module.get<ViewsService>(
      ViewsService
    );
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle amendment succesfully', async () => {
    const orderId = 'test';
    const invoiceNumber = 'test';
    const ecomBusinessCode = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.invoiceDate = '';
    mockInvoice.lineItems = []
    mockInvoice.declarations = []
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const amendment: Amendment = {
      ecomBusinessCode: ecomBusinessCode,
      orderNumber: orderId,
      invoiceNumber: invoiceNumber,
      orderLines: []
    }
    const event = new AmendmentCreatedEvent(
      orderId,
      '',
      invoiceNumber,
      amendment
    );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const orderId = 'test';
    const invoiceNumber = 'test';
    const ecomBusinessCode = 'test';
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const amendment: Amendment = {
      ecomBusinessCode: ecomBusinessCode,
      orderNumber: orderId,
      invoiceNumber: invoiceNumber,
      orderLines: []
    }
    const event = new AmendmentCreatedEvent(
      orderId,
      '',
      invoiceNumber,
      amendment
    );
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + orderId);
  });

  it('should create error when no invoice', async () => {
    const orderId = 'test';
    const invoiceNumber = 'test';
    const ecomBusinessCode = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.lineItems = []
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const amendment: Amendment = {
      ecomBusinessCode: ecomBusinessCode,
      orderNumber: orderId,
      invoiceNumber: invoiceNumber,
      orderLines: []
    }
    const event = new AmendmentCreatedEvent(
      orderId,
      '',
      'wrong',
      amendment
    );

    await eventHandler.handle(event);
    expect(aggregate.addErrorEvent).toBeCalledTimes(1);
    expect(aggregate.commit).toBeCalledTimes(1);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});
