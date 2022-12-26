import { OrderStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import {
  Declaration,
  Invoice,
  LineItem,
  ReturnInvoice,
  ReturnLineItem,
  ReturnOrder,
} from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { OrderReturnedEvent } from '../impl/order-returned.event';
import { OrderReturnedHandler } from './order-returned.handler';
import { ViewsService } from 'aggregates/orders/views/views.service';

describe('order-returned event handler tests', () => {
  let eventHandler: OrderReturnedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const mockInvoice = Mock<Invoice>();
  const mockDeclaration = Mock<Declaration>();
  const aggregate = Mock<OrderAggregate>();


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderReturnedHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    eventHandler = module.get<OrderReturnedHandler>(OrderReturnedHandler);
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    viewService = module.get<ViewsService>(ViewsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle create order succesfully', async () => {
    const invoiceNumber = 'testinvoice';
    const returnInvoice = Mock<ReturnInvoice>();
    const returnLineItem = Mock<ReturnLineItem>();
    returnInvoice.lineItems = [returnLineItem];
    returnInvoice.invoiceNumber = invoiceNumber;
    const returnOrder = Mock<ReturnOrder>();
    returnOrder.invoices = [returnInvoice];
    const event = new OrderReturnedEvent('test', returnOrder, 'vcId');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.status = OrderStatus.Submitted;
    aggregate.returns = []
    mockInvoice.declarations = [mockDeclaration];
    const lineItem = Mock<LineItem>();
    lineItem.lineNo = returnLineItem.lineNo;
    mockInvoice.lineItems = [lineItem];
    mockInvoice.invoiceNumber = invoiceNumber;
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const returnOrder = Mock<ReturnOrder>();
    const event = new OrderReturnedEvent('test', returnOrder, 'vcId');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow(
      'No orderaggregate found for orderId: ' + event.aggregateId,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
  });

  it('no error, but not no data change when no matching invoice', async () => {
    const returnOrder = Mock<ReturnOrder>();
    returnOrder.invoices = [Mock<ReturnInvoice>()];

    const event = new OrderReturnedEvent('test', returnOrder, 'vcId');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});
