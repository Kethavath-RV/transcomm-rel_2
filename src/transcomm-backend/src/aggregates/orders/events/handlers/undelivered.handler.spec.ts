import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CheckPointFile } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { UndeliveredEvent } from '../impl/undelivered.event';
import { UndeliveredHandler } from './undelivered.handler';

describe('undelivered event handler tests', () => {
  let eventHandler: UndeliveredHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  let viewService: ViewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UndeliveredHandler,
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
    eventHandler = module.get<UndeliveredHandler>(
      UndeliveredHandler,
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

  it('should handle create views', async () => {
    const checkPointData = Mock<CheckPointFile>();
    const event = new UndeliveredEvent('test', checkPointData);
    aggregate.order.invoices = [];
    aggregate.delivered = [];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const checkPointData = Mock<CheckPointFile>();
    const event = new UndeliveredEvent('test', checkPointData);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});