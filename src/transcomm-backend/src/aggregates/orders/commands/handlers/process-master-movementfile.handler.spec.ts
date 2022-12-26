import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { MasterMovement } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessMasterMovementFileCommand } from '../impl/process-master-movement-file';
import { ProcessMasterMovementFileHandler } from './process-master-movementfile.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Process master movement file command handler', () => {
  let commandHandler: ProcessMasterMovementFileHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessMasterMovementFileHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());
    commandHandler = module.get<ProcessMasterMovementFileHandler>(
      ProcessMasterMovementFileHandler,
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

    const command: ProcessMasterMovementFileCommand = {
      aggregateId: aggregateKey,
      movementFileData: Mock<MasterMovement>(),
      orderId: aggregateKey.orderId,
      hawb: 'test'
    };

    await commandHandler.execute(command);

    expect(aggregate.processMasterMovementFile).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessMasterMovementFileCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderId: '',
      movementFileData: Mock<MasterMovement>(),
      hawb: 'test'
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.processMasterMovementFile).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
