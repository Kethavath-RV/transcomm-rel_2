import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CheckPointFile } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessDeliveredCommand } from '../impl/process-delivered';
import { ProcessDeliveredHandler } from './process-delivered.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Process delivered command handler', () => {
  let commandHandler: ProcessDeliveredHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDeliveredHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    commandHandler = module.get<ProcessDeliveredHandler>(
      ProcessDeliveredHandler,
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

    const command: ProcessDeliveredCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      pickupFileData: Mock<CheckPointFile>(),
    };

    await commandHandler.execute(command);

    expect(aggregate.processDelivered).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessDeliveredCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderNumber: aggregateKey.orderId,
      pickupFileData: Mock<CheckPointFile>(),
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.processDelivered).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
