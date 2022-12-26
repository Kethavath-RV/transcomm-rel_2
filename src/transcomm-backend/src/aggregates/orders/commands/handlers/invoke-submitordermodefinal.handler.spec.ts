import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { Order, Invoice, HyperledgerResponse } from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { InvokeSubmitOrderMethodCommand } from '../impl/invoke-submitorder-method';
import { InvokeSubmitOrderModeFinalMethodHandler } from './invoke-submitordermodefinal.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('invoke submit order mode final handler', () => {
  let commandHandler: InvokeSubmitOrderModeFinalMethodHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  let datagenClient: DatagenClient;
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvokeSubmitOrderModeFinalMethodHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: DatagenClient,
          useValue: Mock<DatagenClient>(),
        }
      ],
    }).compile();
    module.useLogger(Mock<Logger>());
    commandHandler = module.get<InvokeSubmitOrderModeFinalMethodHandler>(
      InvokeSubmitOrderModeFinalMethodHandler
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    datagenClient = module.get<DatagenClient>(DatagenClient);
  });
  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('invoke submit order mode final submits the order when the conditions are correct', async () => {
    const req: InvokeSubmitOrderMethodCommand = {
      aggregateId: aggregateKey,
      orderNumber: '',
      ecomCode: '',
      retriedBy: null,
      remark: null
    };
    mockInvoice.lineItems = [];
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    aggregate.orderProcessed = true;
    aggregate.submitOrderMethodInvoked = true;
    aggregate.submitOrderModeFinalMethodInvoked = false;
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const mockResponse = Mock<HyperledgerResponse>();
    mockResponse.error = '';
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockResolvedValue(mockResponse);

    await commandHandler.execute(req);
    expect(aggregate.processHyperledgerSubmitOrderModeFinalResponse).toBeCalled();
  });
});