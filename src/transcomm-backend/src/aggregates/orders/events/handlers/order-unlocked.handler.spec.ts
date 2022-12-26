import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { OrderUnlockedEvent } from '../impl/order-unlocked.event';
import { OrderUnlockedEventHandler } from './order-unlocked.handler';

describe('order unlocked event handler tests', () => {
  let eventHandler: OrderUnlockedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderUnlockedEventHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },

        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        }
      ]
    }).compile();
    eventHandler = module.get<OrderUnlockedEventHandler>(
      OrderUnlockedEventHandler,
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

  it('should handle create order succesfully', async () => {
    const event = new OrderUnlockedEvent('test', 'test', 'test');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const event = new OrderUnlockedEvent('test', 'test', 'test');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});