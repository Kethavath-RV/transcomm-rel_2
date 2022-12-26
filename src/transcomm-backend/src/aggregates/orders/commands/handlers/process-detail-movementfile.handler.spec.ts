import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { DetailMovement } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessDetailMovementFileCommand } from '../impl/process-detail-movement-file';
import { ProcessDetailMovementHandler } from './process-detail-movementfile.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Process movement details file command handler', () => {
  let commandHandler: ProcessDetailMovementHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDetailMovementHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    commandHandler = module.get<ProcessDetailMovementHandler>(
      ProcessDetailMovementHandler,
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

    const command: ProcessDetailMovementFileCommand = {
      aggregateId: aggregateKey,
      orderId: aggregateKey.orderId,
      movementFileData: Mock<DetailMovement>(),
    };

    await commandHandler.execute(command);

    expect(aggregate.processDetailMovement).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessDetailMovementFileCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderId: '',
      movementFileData: Mock<DetailMovement>(),
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.processDetailMovement).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
