import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { HyperledgerResponse, Invoice, Order } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ApplicationError } from '../../../../models/error.model';
import { InvokeSubmitOrderMethodForAmendmentCommand } from '../impl/invoke-submitorder-method-for-amendment';
import { InvokeSubmitOrderMethodForAmendmentCommandHandler } from './invoke-submitorder-method-for-amendment.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('invoke submit order method for amendment', () => {
  let commandHandler: InvokeSubmitOrderMethodForAmendmentCommandHandler;
  let aggregateRepo: AggregateRepository;
  let datagenClient: DatagenClient;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeSubmitOrderMethodForAmendmentCommandHandler,
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
      module.get<InvokeSubmitOrderMethodForAmendmentCommandHandler>(
        InvokeSubmitOrderMethodForAmendmentCommandHandler,
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
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeSubmitOrderMethodForAmendmentCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      invoiceNumber,
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitOrderForAmendmentResponse,
    ).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should commit error if invoice missing', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command = new InvokeSubmitOrderMethodForAmendmentCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      'wrong',
      aggregateKey.orderId,
    );
    await commandHandler.execute(command);

    expect(
      aggregate.processHyperledgerSubmitOrderForAmendmentResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).toBeCalled();
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

    const command = new InvokeSubmitOrderMethodForAmendmentCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      invoiceNumber,
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

    const command = new InvokeSubmitOrderMethodForAmendmentCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      invoiceNumber,
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

  it('throws error if order aggregate not found', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command = new InvokeSubmitOrderMethodForAmendmentCommand(
      aggregateKey,
      aggregateKey.ecomCode,
      'test',
      aggregateKey.orderId,
    );
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(
      aggregate.processHyperledgerSubmitOrderForAmendmentResponse,
    ).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });
});
