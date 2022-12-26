import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse, ReturnRequest } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ApplicationError } from '../../../../models/error.model';
import { InvokeReturnUpdateTransportInfoMethodCommand } from '../impl/invoke-return-updatetransportinfo-method';
import { InvokeReturnUpdateTransportInfoMethodHandler } from './invoke-return-updatetransportinfo-method.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('invoke initiate declaration call', () => {
  let commandHandler: InvokeReturnUpdateTransportInfoMethodHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeReturnUpdateTransportInfoMethodHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: DatagenClient,
          useValue: Mock<DatagenClient>(),
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(() => {
              return;
            }),
            error: jest.fn(() => {
              return;
            }),
          },
        },
      ],
    }).compile();
    commandHandler = module.get<InvokeReturnUpdateTransportInfoMethodHandler>(
      InvokeReturnUpdateTransportInfoMethodHandler,
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
    const vcId = 'testVc';
    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    const returnReq = Mock<ReturnRequest>();
    returnReq.vcId = vcId;
    returnReq.updatedShipping = false;
    aggregate.returns = [returnReq];

    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command = new InvokeReturnUpdateTransportInfoMethodCommand(
      aggregateKey,
      vcId,
      null,
    );

    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerReturnUpdateTransportInfoResponse,
    ).toBeCalled();
    expect(aggregate.commit).toBeCalled();
  });

  it('should error when vc id not found', async () => {
    const vcId = 'testVc';
    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    const returnReq = Mock<ReturnRequest>();
    returnReq.vcId = vcId;
    returnReq.updatedShipping = false;
    aggregate.returns = [returnReq];

    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command = new InvokeReturnUpdateTransportInfoMethodCommand(
      aggregateKey,
      'wrong',
      null,
    );

    await expect(commandHandler.execute(command)).rejects.toThrow(
      `return request not found for vcid: ${
        command.vcId
      } aggregate id: ${aggregateKey.key()}`,
    );
  });

  it('should do nothing when return request is already submitted to hl', async () => {
    const vcId = 'testVc';
    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    const returnReq = Mock<ReturnRequest>();
    returnReq.vcId = vcId;
    returnReq.updatedShipping = true;
    aggregate.returns = [returnReq];

    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command = new InvokeReturnUpdateTransportInfoMethodCommand(
      aggregateKey,
      vcId,
      null,
    );

    await commandHandler.execute(command);
    expect(aggregate.commit).not.toBeCalled();
    expect(
      aggregate.processHyperledgerReturnUpdateTransportInfoResponse,
    ).not.toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    const vcId = 'testVc';
    const returnReq = Mock<ReturnRequest>();
    returnReq.vcId = vcId;
    returnReq.updatedShipping = false;
    aggregate.returns = [returnReq];

    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command = new InvokeReturnUpdateTransportInfoMethodCommand(
      aggregateKey,
      vcId,
      null,
    );

    await commandHandler.execute(command);
    expect(aggregate.commit).toBeCalled();
    expect(datagenClient.invokeUpdateTransportInfo).rejects.toEqual(mockError);
    expect(
      aggregate.processHyperledgerReturnUpdateTransportInfoResponse,
    ).not.toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
  });

  it('should commit error events and hyperledger error events if datagen error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    const vcId = 'testVc';
    const returnReq = Mock<ReturnRequest>();
    returnReq.vcId = vcId;
    returnReq.updatedShipping = false;
    aggregate.returns = [returnReq];

    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const command = new InvokeReturnUpdateTransportInfoMethodCommand(
      aggregateKey,
      vcId,
      null,
    );

    await commandHandler.execute(command);
    expect(aggregate.commit).toBeCalled();
    expect(datagenClient.invokeUpdateTransportInfo).rejects.toEqual(mockError);
    expect(
      aggregate.processHyperledgerReturnUpdateTransportInfoResponse,
    ).not.toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalledTimes(1);
  });

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeReturnUpdateTransportInfoMethodCommand(
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
