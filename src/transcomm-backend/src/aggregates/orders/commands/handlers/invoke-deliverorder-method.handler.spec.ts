import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ApplicationError } from '../../../../models/error.model';
import { InvokeDeliverOrderMethodCommand } from '../impl/invoke-deliverorder-method';
import { InvokeDeliverOrderMethodCommandHandler } from './invoke-deliverorder-method.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('invoke deliverorder command', () => {
  let commandHandler: InvokeDeliverOrderMethodCommandHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeDeliverOrderMethodCommandHandler,
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
    commandHandler = module.get<InvokeDeliverOrderMethodCommandHandler>(
      InvokeDeliverOrderMethodCommandHandler,
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
      .spyOn(datagenClient, 'invokeDeliverOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeDeliverOrderMethodCommand(
      aggregateKey,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(aggregate.processDeliverOrderResponse).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest
      .spyOn(datagenClient, 'invokeDeliverOrder')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeDeliverOrderMethodCommand(
      aggregateKey,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(aggregate.processDeliverOrderResponse).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    jest
      .spyOn(datagenClient, 'invokeDeliverOrder')
      .mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeDeliverOrderMethodCommand(
      aggregateKey,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(aggregate.processDeliverOrderResponse).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalledTimes(1);
  });

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeDeliverOrderMethodCommand(
      aggregateKey,
      aggregateKey.orderId,
    );
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregate.processDeliverOrderResponse).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });
});
