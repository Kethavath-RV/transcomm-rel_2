import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { DocumentTrackingData, DocumentType, Invoice, Order } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessHyperledgerEventCommand } from '../impl/process-hl-event';
import { ProcessHyperledgerEventHandler } from './process-hl-event.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('hl event command handler ', () => {
  let commandHandler: ProcessHyperledgerEventHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const mockOrder = Mock<Order>();
  const mockInvoice = Mock<Invoice>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessHyperledgerEventHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        }
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<ProcessHyperledgerEventHandler>(
      ProcessHyperledgerEventHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('documenttracking for doc type DECLARATION should commit without errors', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    const mockDocumentTrackingData = Mock<DocumentTrackingData>();
    mockDocumentTrackingData.documentType = DocumentType.Declaration;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      eventType: 'documenttracking',
      hyperledgerEvent: mockDocumentTrackingData,
      msgType: "TC_DHLE_CORD_ODAT",
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };

    await commandHandler.execute(command);

    expect(aggregate.commit).toBeCalled();
    expect(
      aggregate.processDeclarationDocumentTrackingDataProcessedEvent,
    ).toBeCalled();
    expect(
      aggregate.processClaimDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processDeclarationJsonMappingDataProcessedEvent,
    ).not.toBeCalled();
    expect(aggregate.processClaimRequestDataProcessedEvent).not.toBeCalled();
    expect(aggregate.processInvoiceDataProcessedEvent).not.toBeCalled();
  });

  it('documenttracking for doc type NR_CLAIM should commit without errors', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;
    const mockDocumentTrackingData = Mock<DocumentTrackingData>();
    mockDocumentTrackingData.documentType = DocumentType.Claim;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      eventType: 'documenttracking',
      msgType: "TC_DHLE_CORD_ODAT",
      hyperledgerEvent: mockDocumentTrackingData,
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };

    await commandHandler.execute(command);

    expect(aggregate.commit).toBeCalled();
    expect(
      aggregate.processClaimDocumentTrackingDataProcessedEvent,
    ).toBeCalled();
    expect(
      aggregate.processDeclarationDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processDeclarationJsonMappingDataProcessedEvent,
    ).not.toBeCalled();
    expect(aggregate.processClaimRequestDataProcessedEvent).not.toBeCalled();
    expect(aggregate.processInvoiceDataProcessedEvent).not.toBeCalled();
  });

  it('declaration_json_mapping should commit without errors', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      eventType: 'declaration_json_mapping',
      msgType: "TC_DHLE_CORD_ODAT",
      hyperledgerEvent: Mock<DocumentTrackingData>(),
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };

    await commandHandler.execute(command);

    expect(aggregate.commit).toBeCalled();
    expect(
      aggregate.processDeclarationJsonMappingDataProcessedEvent,
    ).toBeCalled();
    expect(
      aggregate.processDeclarationDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processClaimDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(aggregate.processClaimRequestDataProcessedEvent).not.toBeCalled();
    expect(aggregate.processInvoiceDataProcessedEvent).not.toBeCalled();
  });

  it('claim_request should commit without errors', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      eventType: 'claim_request',
      msgType: "TC_DHLE_CORD_ODAT",
      hyperledgerEvent: Mock<DocumentTrackingData>(),
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };

    await commandHandler.execute(command);

    expect(aggregate.commit).toBeCalled();
    expect(aggregate.processClaimRequestDataProcessedEvent).toBeCalled();
    expect(
      aggregate.processDeclarationDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processClaimDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processDeclarationJsonMappingDataProcessedEvent,
    ).not.toBeCalled();
    expect(aggregate.processInvoiceDataProcessedEvent).not.toBeCalled();
  });

  it('invoice_data should commit without errors', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      msgType: "TC_DHLE_CORD_ODAT",
      eventType: 'invoice_data',
      hyperledgerEvent: Mock<DocumentTrackingData>(),
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };

    await commandHandler.execute(command);

    expect(aggregate.commit).toBeCalled();
    expect(aggregate.processInvoiceDataProcessedEvent).toBeCalled();
    expect(aggregate.processClaimRequestDataProcessedEvent).not.toBeCalled();
    expect(
      aggregate.processDeclarationDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processClaimDocumentTrackingDataProcessedEvent,
    ).not.toBeCalled();
    expect(
      aggregate.processDeclarationJsonMappingDataProcessedEvent,
    ).not.toBeCalled();
  });

  it('should error - aggregate missing', async () => {
    const invoiceNumber = 'test';
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      eventType: 'invoice_data',
      msgType: "TC_DHLE_CORD_ODAT",
      hyperledgerEvent: Mock<DocumentTrackingData>(),
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregateRepo.getById).toBeCalled();
  });

  it('should error - aggregate missing matching invoice', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      msgType: "TC_DHLE_CORD_ODAT",
      eventType: 'invoice_data',
      hyperledgerEvent: Mock<DocumentTrackingData>(),
      invoiceId: 'wrong',
      orderId: aggregateKey.orderId,
      txnId: "test"
    };
    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.commit).toBeCalledTimes(1);
  });

  it('should error - wrong event type', async () => {
    const invoiceNumber = 'test';
    mockInvoice.invoiceNumber = invoiceNumber;
    mockOrder.invoices = [mockInvoice];
    aggregate.order = mockOrder;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessHyperledgerEventCommand = {
      aggregateId: aggregateKey,
      eventType: 'wrong',
      msgType: "TC_DHLE_CORD_ODAT",
      hyperledgerEvent: Mock<DocumentTrackingData>(),
      invoiceId: invoiceNumber,
      orderId: aggregateKey.orderId,
      txnId: "test"
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(aggregateRepo.getById).toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
