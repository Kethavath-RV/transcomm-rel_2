import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { LookupType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { Logger } from '@nestjs/common';
import { ProcessNotificationProcessedCommand } from '../impl/process-notification-processed';
import { ProcessNotificationHandler } from './process-notification.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Process notification file command handler', () => {
  let commandHandler: ProcessNotificationHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessNotificationHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<ProcessNotificationHandler>(
      ProcessNotificationHandler,
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

    const command: ProcessNotificationProcessedCommand = {
      aggregateId: aggregateKey,
      orderId: aggregateKey.orderId,
      lookupType: LookupType.Order,
      vcId: ''
    };

    await commandHandler.execute(command);

    expect(aggregate.processNotificationProcessed).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessNotificationProcessedCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderId: '',
      lookupType: LookupType.Order,
      vcId: ''
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.processNotificationProcessed).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
