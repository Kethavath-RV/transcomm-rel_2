import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AggregateKey } from 'aggregates/orders/commands/handlers/__mocks__/orderAggregate.mock';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import {
  CustomsStatus,
  Declaration,
  DocumentTrackingData,
  Invoice,
  Order,
} from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { DeclarationDocumentTrackingDataProcessedEvent } from '../impl/declaration-documenttrackingdata-processed.event';
import { DeclarationDocumentTrackingDataProcessedEventHandler } from './declaration-documenttrackingdata-processed.handler';

describe('document tracking data processed event handler', () => {
  let eventHandler: DeclarationDocumentTrackingDataProcessedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  const mockDeclaration = Mock<Declaration>();
  const aggregateKey = AggregateKey;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeclarationDocumentTrackingDataProcessedEventHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: CommandBus,
          useValue: Mock<CommandBus>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },
      ],
    }).compile();
    eventHandler =
      module.get<DeclarationDocumentTrackingDataProcessedEventHandler>(
        DeclarationDocumentTrackingDataProcessedEventHandler,
      );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);

    commandBus = module.get<CommandBus>(CommandBus);

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
    const declarationNumber = 'testNo';
    mockDeclaration.hlKey = declarationNumber;
    mockDeclaration.clearanceStatus = CustomsStatus.Cleared;
    mockDeclaration.declarationNumber = 'random';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.dfCheckpointFileReceivedEvent = true;
    mockDeclaration.declarationType = '303';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;
    trackingData.Key = declarationNumber;
    trackingData.errors = '';

    const event: DeclarationDocumentTrackingDataProcessedEvent =
      new DeclarationDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it('should create the correct views - no declaration', async () => {
    const invoiceNumber = 'test';
    const declarationNumber = 'testNo';
    mockDeclaration.hlKey = declarationNumber;
    mockDeclaration.declarationNumber = '';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    mockDeclaration.declarationType = '303';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;
    trackingData.Key = declarationNumber;
    trackingData.errors = '';

    const event: DeclarationDocumentTrackingDataProcessedEvent =
      new DeclarationDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should not create the views if the invoicenumber is wrong', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = 'wrong';

    expect(viewService.HydrateViews).not.toBeCalled();
  });

  it('should create the correct views on error', async () => {
    const invoiceNumber = 'test';
    const declarationNumber = 'testNo';
    mockDeclaration.hlKey = declarationNumber;
    mockDeclaration.clearanceStatus = CustomsStatus.Error;
    mockDeclaration.declarationNumber = 'random';
    mockDeclaration.errors =
      '"[{\\"errorCode\\":\\"502\\",\\"errorDescription\\":\\"Statistical Quantity Unit is invalid for the specified HS Code.\\",\\"errorType\\":\\"business\\",\\"level\\":\\"E\\"}]"';

    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.dfCheckpointFileReceivedEvent = true;
    mockDeclaration.declarationType = '303';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;
    trackingData.Key = declarationNumber;
    trackingData.customsStatus = CustomsStatus.Error;
    trackingData.errors =
      '"[{\\"errorCode\\":\\"502\\",\\"errorDescription\\":\\"Statistical Quantity Unit is invalid for the specified HS Code.\\",\\"errorType\\":\\"business\\",\\"level\\":\\"E\\"}]"';

    const event: DeclarationDocumentTrackingDataProcessedEvent =
      new DeclarationDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
  });

  it('should create the correct views on error - different json string', async () => {
    const invoiceNumber = 'test';
    const declarationNumber = 'testNo';
    mockDeclaration.hlKey = declarationNumber;
    mockDeclaration.clearanceStatus = CustomsStatus.Error;
    mockDeclaration.declarationNumber = 'random';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration];
    mockDeclaration.errors =
      '[{"errorCode":"502","errorDescription":"Statistical Quantity Unit is invalid for the specified HS Code.","errorType":"business","level":"E"}]';
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.dfCheckpointFileReceivedEvent = true;
    mockDeclaration.declarationType = '303';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;
    trackingData.Key = declarationNumber;
    trackingData.customsStatus = CustomsStatus.Error;

    const event: DeclarationDocumentTrackingDataProcessedEvent =
      new DeclarationDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
  });

  it('should error if error json is missing fields', async () => {
    const invoiceNumber = 'test';
    const declarationNumber = 'testNo';
    mockDeclaration.hlKey = declarationNumber;
    mockDeclaration.clearanceStatus = CustomsStatus.Error;
    mockDeclaration.declarationNumber = 'random';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration];
    mockDeclaration.errors =
      '[{"errorCode":"","errorDescription":"Statistical Quantity Unit is invalid for the specified HS Code.","errorType":"business","level":"E"}]';
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.dfCheckpointFileReceivedEvent = true;
    mockDeclaration.declarationType = '303';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;
    trackingData.Key = declarationNumber;
    trackingData.customsStatus = CustomsStatus.Error;

    const event: DeclarationDocumentTrackingDataProcessedEvent =
      new DeclarationDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await expect(eventHandler.handle(event)).rejects.toThrow();
  });

  it('sends the SendDHLEDeclarationResponseCommand if the corresponding declarationResponse is completed', async () => {
    const invoiceNumber = 'test';
    const declarationNumber = 'testNo';
    mockDeclaration.hlKey = declarationNumber;
    mockDeclaration.clearanceStatus = CustomsStatus.Cleared;
    mockDeclaration.declarationNumber = 'random';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.dfCheckpointFileReceivedEvent = true;
    aggregate.isDeclarationResponseComplete.mockReturnValue(true);
    mockDeclaration.declarationType = '303';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const trackingData = Mock<DocumentTrackingData>();
    trackingData.invoiceNo = invoiceNumber;
    trackingData.createdAt = 1627475941306;
    trackingData.Key = declarationNumber;
    trackingData.errors = '';

    const event: DeclarationDocumentTrackingDataProcessedEvent =
      new DeclarationDocumentTrackingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(aggregate.isDeclarationResponseComplete).toBeCalledTimes(1);
    expect(commandBus.execute).toBeCalledTimes(2);
  });
});
