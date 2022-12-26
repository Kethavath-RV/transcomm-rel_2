import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CancelInvoice, CancelOrder, Invoice, ModeType, Movement, Order } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { OrderCancelledEvent } from '../impl/order-cancelled.event';
import { OrderCancelledHandler } from './order-cancelled.handler';

describe('order cancelled event handler tests', () => {
  let eventHandler: OrderCancelledHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCancelledHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        }
      ]
    }).compile();
    eventHandler = module.get<OrderCancelledHandler>(
      OrderCancelledHandler,
    );

    aggregateRepo = module.get<AggregateRepository>(
      AggregateRepository
    );
    viewService = module.get<ViewsService>(ViewsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle create order succesfully', async () => {
    const orderNumber = 'testOrder';
    const invoiceNumber = 'testInvoice';
    const request = Mock<CancelOrder>();
    const requestInvoice = Mock<CancelInvoice>();
    request.mode = ModeType.Cancel;
    request.orderNumber = orderNumber;
    requestInvoice.invoiceNumber = invoiceNumber;
    request.invoices = [requestInvoice];
    aggregate.movementData = {} as Movement;
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.invoiceDate = new Date().toISOString();
    mockInvoice.lineItems = [];
    mockOrder.orderNumber = orderNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const event = new OrderCancelledEvent('test', request);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should handle create order invalid - no ui change', async () => {
    const orderNumber = 'testOrder';
    const invoiceNumber = 'testInvoice';
    const request = Mock<CancelOrder>();
    const requestInvoice = Mock<CancelInvoice>();
    request.mode = ModeType.Cancel;
    request.orderNumber = orderNumber;
    requestInvoice.invoiceNumber = invoiceNumber;
    request.invoices = [requestInvoice];
    aggregate.movementData = {} as Movement;
    mockInvoice.invoiceNumber = 'different';
    mockInvoice.lineItems = [];
    mockOrder.orderNumber = orderNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const event = new OrderCancelledEvent('test', request);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).not.toBeCalled();
  });


  it('should error no aggregate', async () => {
    const request = Mock<CancelOrder>();
    const event = new OrderCancelledEvent('test', request);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
  });
});