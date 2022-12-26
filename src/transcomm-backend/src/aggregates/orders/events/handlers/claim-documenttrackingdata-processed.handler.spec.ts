import { Test, TestingModule } from '@nestjs/testing';
import { AggregateKey } from 'aggregates/orders/commands/handlers/__mocks__/orderAggregate.mock';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Declaration, DocumentTrackingData, Invoice, Order } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ClaimDocumentTrackingDataProcessedEvent } from '../impl/claim-documenttrackingdata-processed.event';
import { ClaimDocumentTrackingDataProcessedEventHandler } from './claim-documenttrackingdata-processed.handler';

describe('document tracking data processed event handler', () => {
  let eventHandler: ClaimDocumentTrackingDataProcessedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimDocumentTrackingDataProcessedEventHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        },
      ],
    }).compile();
    eventHandler = module.get<ClaimDocumentTrackingDataProcessedEventHandler>(
      ClaimDocumentTrackingDataProcessedEventHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    viewService = module.get<ViewsService>(ViewsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should create the correct views', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [Mock<Declaration>()];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;

    const event: ClaimDocumentTrackingDataProcessedEvent =
      new ClaimDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should create the correct views', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = 'wrong';

    expect(viewService.HydrateViews).not.toBeCalled();
  });
});
