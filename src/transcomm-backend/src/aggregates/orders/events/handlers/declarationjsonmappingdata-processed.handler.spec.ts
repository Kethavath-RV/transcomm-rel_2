import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AggregateKey } from 'aggregates/orders/commands/handlers/__mocks__/orderAggregate.mock';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Declaration, DeclarationJsonMappingData, Invoice } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { DeclarationJsonMappingDataProcessedEvent } from '../impl/declarationjsonmappingdata-processed.event';
import { DeclarationJsonMappingDataProcessedEventHandler } from './declarationjsonmappingdata-processed.handler';

describe('declaration json mapping data process handle event', () => {
  let eventHandler: DeclarationJsonMappingDataProcessedEventHandler;
  let aggregateRepo: AggregateRepository;
  let commandBus: CommandBus;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  const mockInvoice = Mock<Invoice>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeclarationJsonMappingDataProcessedEventHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },
        { provide: CommandBus, useValue: Mock<CommandBus>() },
      ],
    }).compile();
    eventHandler = module.get<DeclarationJsonMappingDataProcessedEventHandler>(
      DeclarationJsonMappingDataProcessedEventHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    viewService = module.get<ViewsService>(ViewsService);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should create the correct views', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    mockInvoice.declarations = [Mock<Declaration>()];
    aggregate.order.invoices = [mockInvoice];
    const trackingData = Mock<DeclarationJsonMappingData>();
    const event: DeclarationJsonMappingDataProcessedEvent =
      new DeclarationJsonMappingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('errors when no aggregate ', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    const trackingData = Mock<DeclarationJsonMappingData>();
    const event: DeclarationJsonMappingDataProcessedEvent =
      new DeclarationJsonMappingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await expect(eventHandler.handle(event)).rejects.toThrow(
      'No order with orderId: ' + event.aggregateId + ' was found',
    );
  });

  it('sends the SendDHLEDeclarationResponseCommand if the corresponding declarationResponse is completed', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    mockInvoice.declarations = [Mock<Declaration>()];
    aggregate.order.invoices = [mockInvoice];
    aggregate.isDeclarationResponseComplete.mockReturnValue(true);
    const trackingData = Mock<DeclarationJsonMappingData>();
    const event: DeclarationJsonMappingDataProcessedEvent =
      new DeclarationJsonMappingDataProcessedEvent(
        aggregateKey.key(),
        trackingData,
      );

    await eventHandler.handle(event);
    expect(commandBus.execute).toBeCalledTimes(1);
    expect(viewService.HydrateViews).toBeCalled();
  });
});
