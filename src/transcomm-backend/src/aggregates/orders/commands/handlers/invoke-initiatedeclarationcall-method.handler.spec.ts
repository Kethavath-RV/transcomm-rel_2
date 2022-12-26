import { OrderStatus } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { InvokeInitiateDeclarationCallMethodCommand } from '../impl/invoke-initiatedeclarationcall-method';
import { InvokeInitiateDeclarationCallMethodCommandHandler } from './invoke-initiatedeclarationcall-method.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';
import { ApplicationError } from '../../../../models/error.model';

describe('invoke initiate declaration call', () => {
  let commandHandler: InvokeInitiateDeclarationCallMethodCommandHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeInitiateDeclarationCallMethodCommandHandler,
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
      module.get<InvokeInitiateDeclarationCallMethodCommandHandler>(
        InvokeInitiateDeclarationCallMethodCommandHandler,
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
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerInitiateDeclarationCallResponse,
    ).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerInitiateDeclarationCallResponse,
    ).not.toBeCalled();
    expect(datagenClient.invokeInitiateDeclaration).rejects.toEqual(mockError);
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    jest
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(datagenClient.invokeInitiateDeclaration).rejects.toEqual(mockError);
    expect(
      aggregate.processHyperledgerInitiateDeclarationCallResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalledTimes(1);
  });

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(
      aggregate.processHyperledgerInitiateDeclarationCallResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('if order is cancelled do nothing', async () => {
    aggregate.status = OrderStatus.OrderCancelled;
    jest
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockRejectedValue(Mock<HyperledgerResponse>());
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerInitiateDeclarationCallResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
    expect(aggregate.addErrorEvent).toBeCalled();
  });

  it('adds error event if invokeInitialDeclaration method returns nothing. ProcessHyperledgerInitiateDeclarationCallResponse not called.', async () => {
    jest
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockRejectedValue(null);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      'test',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerInitiateDeclarationCallResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
    expect(aggregate.addErrorEvent).toBeCalled();
  });
});
