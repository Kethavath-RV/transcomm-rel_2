import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { MasterMovement, Movement } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { MasterMovementFileReceivedEvent } from '../impl/master-movementfile-received';
import { MasterMovementFileReceivedHandler } from './master-movementfile-received.handler';

describe('Master movement received event handler', () => {
  let eventHandler: MasterMovementFileReceivedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterMovementFileReceivedHandler,
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
    eventHandler =
      module.get<MasterMovementFileReceivedHandler>(
        MasterMovementFileReceivedHandler,
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

  it('views should be created', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const mockMaster = Mock<MasterMovement>();
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    aggregate.returns = []
    const request = new MasterMovementFileReceivedEvent(
      'test',
      mockMaster,
      'test'
    );
    await eventHandler.handle(request);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('throws error when no aggregate', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    const mockMaster = Mock<MasterMovement>();
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    const request = new MasterMovementFileReceivedEvent(
      'test',
      mockMaster,
      'test'
    );
    await expect(eventHandler.handle(request)).rejects.toThrow('No orderaggregate found for orderId: ' + request.aggregateId);
  });
});