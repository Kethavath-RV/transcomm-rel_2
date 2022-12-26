import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse, ReturnRequest } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { AggregateKey } from './__mocks__/orderAggregate.mock';
import { InvokeReturnOrderMethodCommand } from '../impl/invoke-returnorder-method';
import { InvokeReturnOrderMethodHandler } from './invoke-returnorder-method.handler';
import { ApplicationError } from '../../../../models/error.model';

describe('invoke initiate declaration call', () => {
  let commandHandler: InvokeReturnOrderMethodHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeReturnOrderMethodHandler,
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

    commandHandler = module.get<InvokeReturnOrderMethodHandler>(
      InvokeReturnOrderMethodHandler,
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
    const vcId = 'test';
    const mockResponse = Mock<HyperledgerResponse>();
    const returnsMock = Mock<ReturnRequest>();
    returnsMock.vcId = vcId;
    aggregate.returns = [returnsMock];
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeReturnOrderMethodCommand(aggregateKey, vcId);
    await commandHandler.execute(command);

    expect(aggregate.processHyperledgerSubmitReturnOrderResponse).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
    expect(aggregate.processHyperledgerError).not.toBeCalled();
  });

  it('should commit with errors when return request not found', async () => {
    const vcId = 'test';
    const mockResponse = Mock<HyperledgerResponse>();
    const returnsMock = Mock<ReturnRequest>();
    returnsMock.vcId = 'wrong';
    aggregate.returns = [returnsMock];
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeReturnOrderMethodCommand(aggregateKey, vcId);
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitReturnOrderResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    const vcId = 'test';
    const returnsMock = Mock<ReturnRequest>();
    returnsMock.vcId = vcId;
    aggregate.returns = [returnsMock];
    jest.spyOn(datagenClient, 'invokeReturnOrder').mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeReturnOrderMethodCommand(aggregateKey, vcId);
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitReturnOrderResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
  });

  it('should commit error events and hyperledger error events if datagen error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    const vcId = 'test';
    const returnsMock = Mock<ReturnRequest>();
    returnsMock.vcId = vcId;
    aggregate.returns = [returnsMock];
    jest.spyOn(datagenClient, 'invokeReturnOrder').mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeReturnOrderMethodCommand(aggregateKey, vcId);
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitReturnOrderResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalledTimes(1);
  });

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeReturnOrderMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await expect(commandHandler.execute(command)).rejects.toThrow(
      `No orderaggregate found for aggregate id: ${aggregateKey.key()}`,
    );
    expect(
      aggregate.processHyperledgerSubmitReturnOrderResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });
});
