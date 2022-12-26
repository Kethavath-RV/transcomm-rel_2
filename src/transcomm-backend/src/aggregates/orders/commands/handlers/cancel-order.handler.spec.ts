import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CancelOrder, ModeType } from 'core';
import { AggregateRepository } from 'event-sourcing/aggregate-repository';
import Mock from 'jest-mock-extended/lib/Mock';
import { CancelOrderCommand } from '../impl/cancel-order';
import { CancelOrderHandler } from './cancel-order.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('cancel order command handler', () => {
  let commandHandler: CancelOrderHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelOrderHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<CancelOrderHandler>(CancelOrderHandler);
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit successfully', async () => {
    aggregate.updateTransportInfoMethodInvoked = false;
    aggregate.order.mode = ModeType.Final;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command: CancelOrderCommand = {
      aggregateId: aggregateKey,
      cancelOrder: Mock<CancelOrder>(),
    };
    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.cancelOrder).toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });

  it('should not commit if transPortInfoMethodInvoked', async () => {
    aggregate.updateTransportInfoMethodInvoked = true;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command: CancelOrderCommand = {
      aggregateId: aggregateKey,
      cancelOrder: Mock<CancelOrder>(),
    };
    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.cancelOrder).not.toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
  });

  it('should throw error if aggregateId is undefined', async () => {
    aggregate.updateTransportInfoMethodInvoked = true;
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command: CancelOrderCommand = {
      aggregateId: {} as OrderAggregateKey,
      cancelOrder: Mock<CancelOrder>(),
    };

    command.aggregateId.key = () => '';
    await commandHandler.execute(command);

    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.cancelOrder).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
