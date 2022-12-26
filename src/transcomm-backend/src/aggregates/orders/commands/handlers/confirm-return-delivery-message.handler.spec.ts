import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ConfirmReturnDelivery } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ConfirmReturnDeliveryMessageReceivedCommand } from '../impl/confirm-return-delivery-message';
import { ConfirmReturnDeliveryMessageReceivedCommandHandler } from './confirm-return-delivery-message.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Confirm return delivery command handler', () => {
  let commandHandler: ConfirmReturnDeliveryMessageReceivedCommandHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmReturnDeliveryMessageReceivedCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        }
      ],
    }).compile();
    module.useLogger(Mock<Logger>());


    commandHandler =
      module.get<ConfirmReturnDeliveryMessageReceivedCommandHandler>(
        ConfirmReturnDeliveryMessageReceivedCommandHandler,
      );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit successfully', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command: ConfirmReturnDeliveryMessageReceivedCommand = {
      aggregateId: aggregateKey,
      vcId: '',
      confirmReturnDelivery: {} as ConfirmReturnDelivery
    };
    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.confirmReturnDeliveryMessageReceived).toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });

  it('should throw error if aggregateId is undefined', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command: ConfirmReturnDeliveryMessageReceivedCommand = {
      aggregateId: {} as OrderAggregateKey,
      vcId: '',
      confirmReturnDelivery: {} as ConfirmReturnDelivery
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.commit).not.toBeCalled();
  });

  it('should throw error if aggregate returns null', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    const command: ConfirmReturnDeliveryMessageReceivedCommand = {
      aggregateId: aggregateKey,
      vcId: '',
      confirmReturnDelivery: {} as ConfirmReturnDelivery
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.commit).not.toBeCalled();
  });
});
