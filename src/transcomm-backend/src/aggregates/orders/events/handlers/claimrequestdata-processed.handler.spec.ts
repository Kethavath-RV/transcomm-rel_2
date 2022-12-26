import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Order, Invoice, Declaration } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ClaimRequestDataProcessedEvent } from '../impl/claimrequestdata-processed.event';
import { ClaimRequestDataProcessedEventHandler } from './claimrequestdata-processed.handler';
import { mockClaimRequest } from './__mocks__/claimRequestData.mock';

describe('claim request data processed event', () => {
  let eventHandler: ClaimRequestDataProcessedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();
  const mockDeclaration = Mock<Declaration>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimRequestDataProcessedEventHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        },
      ]
    }).compile();
    module.useLogger(Mock<Logger>());


    eventHandler = module.get<ClaimRequestDataProcessedEventHandler>(
      ClaimRequestDataProcessedEventHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(
      AggregateRepository
    );
    viewService = module.get<ViewsService>(
      ViewsService
    );
  });


  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle amendment succesfully', async () => {
    const invoiceNumber = 'test';
    const declarationsNumber = 'test';
    mockDeclaration.declarationNumber = declarationsNumber;
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration]
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    const claimRequestData = mockClaimRequest;
    claimRequestData.DataArea.ClaimCreationRequest.DeclarationNumber = declarationsNumber;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const event = new ClaimRequestDataProcessedEvent(
      '',
      claimRequestData
    );

    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should commit error', async () => {
    const invoiceNumber = 'test';
    const declarationsNumber = 'test';
    mockDeclaration.declarationNumber = declarationsNumber;
    mockInvoice.invoiceNumber = invoiceNumber;
    mockInvoice.declarations = [mockDeclaration]
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    const claimRequestData = mockClaimRequest;
    claimRequestData.DataArea.ClaimCreationRequest.DeclarationNumber = 'wrong';

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    const event = new ClaimRequestDataProcessedEvent(
      '',
      claimRequestData
    );

    await eventHandler.handle(event);
    expect(aggregate.addErrorEvent).toBeCalledTimes(1);
    expect(aggregate.commit).toBeCalledTimes(1);
    expect(viewService.HydrateViews).not.toBeCalled();
  });

  it('should throw error no order aggregate ', async () => {
    const claimRequestData = mockClaimRequest;
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const event = new ClaimRequestDataProcessedEvent(
      'testAggregateId',
      claimRequestData
    );

    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
  });


});