import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { OtherCheckpointFileReceivedEvent } from '../impl/other-checkpointfile-received.event';
import { OtherCheckpointFileReceivedHandler } from './other-checkpointfile-received.handler';

describe('Other checkpoint file event handler', () => {
  let eventHandler: OtherCheckpointFileReceivedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtherCheckpointFileReceivedHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ]
    }).compile();
    module.useLogger(Mock<Logger>());
    eventHandler = module.get<OtherCheckpointFileReceivedHandler>(OtherCheckpointFileReceivedHandler);
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

  it('should hydrate views if aggregate exists', async () => {
    const mockReq = Mock<OtherCheckpointFileReceivedEvent>();
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(mockReq);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should not hydrate views if aggregate does not exists', async () => {
    const mockReq = Mock<OtherCheckpointFileReceivedEvent>();
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(mockReq)).rejects.toThrow('No orderaggregate found for orderId: ' + mockReq.aggregateId);
  });
});