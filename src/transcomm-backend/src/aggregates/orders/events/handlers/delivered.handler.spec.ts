import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CheckPointFile, DeliveredView, Direction } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { DeliveredEvent } from '../impl/delivered.event';
import { DeliveredHandler } from './delivered.handler';

describe('delivered event handler tests', () => {
  let eventHandler: DeliveredHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  let commandBus: CommandBus;
  const aggregate = Mock<OrderAggregate>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveredHandler,
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
      ]
    }).compile();
    eventHandler = module.get<DeliveredHandler>(
      DeliveredHandler,
    );

    aggregateRepo = module.get<AggregateRepository>(
      AggregateRepository
    );

    commandBus = module.get<CommandBus>(
      CommandBus
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
    const hawb = 'test';
    const checkPointData = Mock<CheckPointFile>();
    checkPointData.hawb = hawb;
    const event = new DeliveredEvent('test', checkPointData);
    const mockDeliveredView = Mock<DeliveredView>();
    mockDeliveredView.airwayBillNumber = hawb;
    mockDeliveredView.deliveryCode = 'OK';
    aggregate.delivered = [mockDeliveredView];
    aggregate.order.invoices = [];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should handle create view for only the bill in event', async () => {
    const hawb = 'test';
    const checkPointData = Mock<CheckPointFile>();
    checkPointData.hawb = hawb;
    const mockDeliveredView = Mock<DeliveredView>();
    mockDeliveredView.airwayBillNumber = hawb;
    mockDeliveredView.deliveryCode = 'OK';
    const event = new DeliveredEvent('test', checkPointData);
    aggregate.delivered = [
      mockDeliveredView,
      Mock<DeliveredView>(),
    ];
    aggregate.order.invoices = [];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should call deliver order method command when the order is in the correct state', async () => {
    const hawb = 'test';
    const checkPointData = Mock<CheckPointFile>();
    checkPointData.hawb = hawb;
    const mockDeliveredView = Mock<DeliveredView>();
    mockDeliveredView.airwayBillNumber = hawb;
    mockDeliveredView.deliveryCode = 'OK';
    const event = new DeliveredEvent('test', checkPointData);
    aggregate.delivered = [
      mockDeliveredView,
      Mock<DeliveredView>(),
    ];
    aggregate.order.invoices = [];
    aggregate.deliverOrderMethodInvoked = false;
    aggregate.direction = Direction.Outbound;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const checkPointData = Mock<CheckPointFile>();
    const event = new DeliveredEvent('test', checkPointData);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for aggregate id: ' + event.aggregateId);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});