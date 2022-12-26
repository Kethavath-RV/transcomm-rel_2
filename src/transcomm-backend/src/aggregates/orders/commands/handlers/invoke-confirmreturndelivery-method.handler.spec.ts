import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ConfirmReturnDelivery, HyperledgerResponse } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ApplicationError } from '../../../../models/error.model';
import { InvokeConfirmReturnDeliveryMethodCommand } from '../impl/invoke-confirmreturndelivery-method';
import { InvokeConfirmReturnDeliveryMethodCommandHandler } from './invoke-confirmreturndelivery-method.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('invoke confirm return delivery method command', () => {
  let commandHandler: InvokeConfirmReturnDeliveryMethodCommandHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeConfirmReturnDeliveryMethodCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: DatagenClient,
          useValue: Mock<DatagenClient>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler =
      module.get<InvokeConfirmReturnDeliveryMethodCommandHandler>(
        InvokeConfirmReturnDeliveryMethodCommandHandler,
      );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    datagenClient = module.get<DatagenClient>(DatagenClient);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit without errors', async () => {
    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeConfirmReturnDelivery')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.confirmReturnDeliveries['test'] = {} as ConfirmReturnDelivery;

    const command = new InvokeConfirmReturnDeliveryMethodCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      'test',
      aggregateKey.orderId,
      'test',
    );
    await commandHandler.execute(command);

    expect(aggregate.processConfirmReturnDeliveryResponse).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should commit error and hyperledger events when hyperledger client returns error', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest
      .spyOn(datagenClient, 'invokeConfirmReturnDelivery')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeConfirmReturnDeliveryMethodCommand(
      aggregateKey,
      aggregateKey.orderId,
      aggregateKey.ecomCode,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(aggregate.processConfirmReturnDeliveryResponse).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
  });

  it('should commit error and hyperledger events when hyperledger client returns error', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    jest
      .spyOn(datagenClient, 'invokeConfirmReturnDelivery')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeConfirmReturnDeliveryMethodCommand(
      aggregateKey,
      aggregateKey.orderId,
      aggregateKey.ecomCode,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(aggregate.processConfirmReturnDeliveryResponse).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalledTimes(1);
  });

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeConfirmReturnDeliveryMethodCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      'test',
      aggregateKey.orderId,
      '',
    );
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.processConfirmReturnDeliveryResponse).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });
});
