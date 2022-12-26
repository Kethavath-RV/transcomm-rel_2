import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CheckPointFile, HouseBillView } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { PickupFileReceivedEvent } from '../impl/pickupfile-received.event';
import { PickupFileReceivedHandler } from './pickupfile-received.handler';

describe('pickup file received event handler tests', () => {
  let eventHandler: PickupFileReceivedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickupFileReceivedHandler,
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
    eventHandler = module.get<PickupFileReceivedHandler>(
      PickupFileReceivedHandler,
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
    const checkpointFile = Mock<CheckPointFile>();
    const event = new PickupFileReceivedEvent('test', checkpointFile);
    aggregate.houseBills = [];
    aggregate.order.invoices = [];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should handle create views for all bills', async () => {
    const checkpointFile = Mock<CheckPointFile>();
    const event = new PickupFileReceivedEvent('test', checkpointFile);
    aggregate.houseBills = [
      Mock<HouseBillView>(),
      Mock<HouseBillView>(),
    ];
    aggregate.order.invoices = [];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const checkpointFile = Mock<CheckPointFile>();

    const event = new PickupFileReceivedEvent('test', checkpointFile);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});