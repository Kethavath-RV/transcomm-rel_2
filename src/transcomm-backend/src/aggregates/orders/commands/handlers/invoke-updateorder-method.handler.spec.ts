import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse, ReturnRequest } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ApplicationError } from '../../../../models/error.model';
import { InvokeUpdateOrderMethodCommand } from '../impl/invoke-updateorder-method';
import { InvokeUpdateOrderMethodCommandHandler } from './invoke-updateorder-method.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('invoke initiate declaration call', () => {
  let commandHandler: InvokeUpdateOrderMethodCommandHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeUpdateOrderMethodCommandHandler,
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

    commandHandler = module.get<InvokeUpdateOrderMethodCommandHandler>(
      InvokeUpdateOrderMethodCommandHandler,
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

    const command = new InvokeUpdateOrderMethodCommand(aggregateKey, vcId);
    await commandHandler.execute(command);

    expect(aggregate.processHyperledgerSubmitUpdateOrderResponse).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
    expect(aggregate.processHyperledgerError).not.toBeCalled();
  });

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeUpdateOrderMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await expect(commandHandler.execute(command)).rejects.toThrow(
      `No orderaggregate found for aggregate id: ${aggregateKey.key()}`,
    );
    expect(
      aggregate.processHyperledgerSubmitUpdateOrderResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    jest.spyOn(datagenClient, 'invokeSubmitOrder').mockRejectedValue(mockError);

    const command = new InvokeUpdateOrderMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);
    expect(
      aggregate.processHyperledgerSubmitUpdateOrderResponse,
    ).not.toBeCalled();
    expect(datagenClient.invokeSubmitOrder).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });
  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    jest.spyOn(datagenClient, 'invokeSubmitOrder').mockRejectedValue(mockError);

    const command = new InvokeUpdateOrderMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);
    expect(
      aggregate.processHyperledgerSubmitUpdateOrderResponse,
    ).not.toBeCalled();
    expect(datagenClient.invokeSubmitOrder).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });
});
