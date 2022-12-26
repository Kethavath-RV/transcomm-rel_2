import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CheckPointFile } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessPickupFileCommand } from '../impl/process-pickupfile';
import { ProcessPickupFileHandler } from './process-pickupfile.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Process pickup file command handler', () => {
  let commandHandler: ProcessPickupFileHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPickupFileHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    commandHandler = module.get<ProcessPickupFileHandler>(
      ProcessPickupFileHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit without errors', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessPickupFileCommand = {
      aggregateId: aggregateKey,
      pickupFileData: Mock<CheckPointFile>(),
    };

    await commandHandler.execute(command);

    expect(aggregate.processPickupFile).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessPickupFileCommand = {
      aggregateId: {} as OrderAggregateKey,
      pickupFileData: Mock<CheckPointFile>(),
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.processPickupFile).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
