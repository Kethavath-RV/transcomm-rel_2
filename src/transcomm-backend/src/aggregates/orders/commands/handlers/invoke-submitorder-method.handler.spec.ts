import { OrderStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse, Invoice, LineItem, Order } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { InvokeSubmitOrderMethodCommand } from '../impl/invoke-submitorder-method';
import { InvokeSubmitOrderMethodHandler } from './invoke-submitorder-method.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';
import { Logger } from '@nestjs/common';
import { ApplicationError } from '../../../../models/error.model';

describe('invoke submit order method', () => {
  let commandHandler: InvokeSubmitOrderMethodHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  let datagenClient: DatagenClient;
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeSubmitOrderMethodHandler,
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
    commandHandler = module.get<InvokeSubmitOrderMethodHandler>(
      InvokeSubmitOrderMethodHandler,
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

  it('InvokeSubmitOrderCommand should invoke hyperledger only once', async () => {
    mockInvoice.lineItems = [Mock<LineItem>()];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.orderProcessed = true;
    aggregate.submitOrderMethodInvoked = false;

    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeSubmitOrderMethodCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(datagenClient.invokeSubmitOrder).toBeCalledTimes(1);
    expect(aggregate.processHyperledgerSubmitOrderResponse).toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('return order should be submitted once to hyperledger', async () => {
    mockInvoice.lineItems = [Mock<LineItem>()];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.orderProcessed = true;
    aggregate.status = OrderStatus.ReturnCreated;
    aggregate.pickupFileAddedForReturn = true;
    aggregate.orderReturnProcessed = true;

    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeSubmitOrderMethodCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(datagenClient.invokeSubmitOrder).toBeCalledTimes(1);
    expect(aggregate.processHyperledgerSubmitOrderResponse).toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should commit error events and hyperledger error events if hyperledger error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(datagenClient, 'invokeSubmitOrder').mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeSubmitOrderMethodCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitOrderForAmendmentResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalled();
  });

  it('should commit error events and hyperledger error events if datagen error is thrown', async () => {
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'DG');
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(datagenClient, 'invokeSubmitOrder').mockRejectedValue(mockError);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeSubmitOrderMethodCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitOrderForAmendmentResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
    expect(aggregate.processHyperledgerError).toBeCalledTimes(1);
  });
});
