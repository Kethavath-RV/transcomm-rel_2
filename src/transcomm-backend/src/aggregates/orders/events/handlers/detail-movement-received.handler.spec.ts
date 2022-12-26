import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { DetailMovement, Direction, Movement } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { DetailMovementReceivedEvent } from '../impl/detail-movement-received';
import { DetailMovementReceivedHandler } from './detail-movement-received.handler';

describe('order locked event handler tests', () => {
  let eventHandler: DetailMovementReceivedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  let commandBus: CommandBus;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetailMovementReceivedHandler,
        {
          provide: CommandBus,
          useValue: Mock<CommandBus>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        },
      ]
    }).compile();
    module.useLogger(Mock<Logger>());

    eventHandler = module.get<DetailMovementReceivedHandler>(
      DetailMovementReceivedHandler,
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

  it('should handle detail movement succesfully but no smart contract call', async () => {
    const detailFile = Mock<DetailMovement>()
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    aggregate.returns = []
    const event = new DetailMovementReceivedEvent('test', detailFile);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should handle detail movement succesfully and call smart contract', async () => {
    const detailFile = Mock<DetailMovement>()
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    aggregate.returns = []
    aggregate.direction = Direction.Outbound;
    const event = new DetailMovementReceivedEvent('test', detailFile);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.submitOrderMethodInvoked = true;
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it(' no smart contract call', async () => {
    const detailFile = Mock<DetailMovement>()
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    aggregate.returns = []
    const event = new DetailMovementReceivedEvent('test', detailFile);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.submitOrderMethodInvoked = false;
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should error no aggregate', async () => {
    const detailFile = Mock<DetailMovement>()
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    const event = new DetailMovementReceivedEvent('test', detailFile);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
    expect(viewService.HydrateViews).not.toBeCalled();
  });
});