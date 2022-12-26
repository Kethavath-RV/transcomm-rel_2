import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CheckPointFile } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessOtherCheckpointFileHandler } from './process-other-checkpointfile.handler';

describe('process other checkpoint file command handler', () => {
  let commandHandler: ProcessOtherCheckpointFileHandler;
  const aggregate = Mock<OrderAggregate>();
  let aggregateRepo: AggregateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessOtherCheckpointFileHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ]
    }).compile();
    commandHandler = module.get<ProcessOtherCheckpointFileHandler>(ProcessOtherCheckpointFileHandler);
    aggregateRepo = module.get<AggregateRepository>(
      AggregateRepository
    );
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should call process other checkpoint file when an aggregate is found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await commandHandler.execute({
      aggregateId: new OrderAggregateKey("test", "test"),
      pickupFileData: Mock<CheckPointFile>()
    });
    expect(aggregate.processOtherCheckpointFile).toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });

  it('should not call process other checkpoint file when an aggregate is not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    const request = {
      aggregateId: new OrderAggregateKey("test", "test"),
      pickupFileData: Mock<CheckPointFile>()
    };
    await expect(commandHandler.execute(request)).rejects.toThrow('No orderaggregate found for aggregate id: ' + request.aggregateId.key());
    expect(aggregate.processOtherCheckpointFile).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});