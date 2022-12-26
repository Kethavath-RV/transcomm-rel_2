import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import {
  CheckPointFile,
  DHLEDeclarationRequest,
  DHLEInvoice,
  Direction,
  Invoice,
  ReturnRequest,
} from 'core';
import { AggregateRepository } from 'event-sourcing';
import { mockDeep } from 'jest-mock-extended';
import Mock from 'jest-mock-extended/lib/Mock';
import { CreateAmendmentFromDeclarationRequestCommand } from '../impl/create-amendment-declaration-request';
import { CreateAmendmentFromDeclarationRequestCommandHandler } from './create-amendment-declaration-request.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('amendment command handler', () => {
  let commandHandler: CreateAmendmentFromDeclarationRequestCommandHandler;
  let aggregateRepo: AggregateRepository;
  const mockOrderAggregate = Mock<OrderAggregate>();
  const mockDeclarationRequest = mockDeep<DHLEDeclarationRequest>();
  const mockToAmendInvoice = Mock<Invoice>();
  const mockPickupFile = Mock<CheckPointFile>();
  const mockDHLEInvoice = mockDeep<DHLEInvoice>();
  const mockReturnRequest = mockDeep<ReturnRequest>();
  const aggregateKey = AggregateKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAmendmentFromDeclarationRequestCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());
    commandHandler =
      module.get<CreateAmendmentFromDeclarationRequestCommandHandler>(
        CreateAmendmentFromDeclarationRequestCommandHandler,
      );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should submit amendment for outbound order', async () => {
    mockToAmendInvoice.invoiceNumber = 'test';
    mockDHLEInvoice.InvoiceNumber = 'test';
    mockDeclarationRequest.Declaration.Consignments.ShippingDetails.Invoices = [
      mockDHLEInvoice,
    ];
    mockOrderAggregate.declarationRequest = mockDeclarationRequest;
    mockOrderAggregate.direction = Direction.Outbound;
    mockOrderAggregate.order.invoices = [mockToAmendInvoice];

    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(mockOrderAggregate);

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).not.toBeCalled();
    expect(mockOrderAggregate.submitAmendment).toBeCalled();
    expect(mockOrderAggregate.commit).toBeCalledTimes(1);
  });

  it('should submit amendment for inbound order (return)', async () => {
    mockToAmendInvoice.invoiceNumber = 'test';
    mockDHLEInvoice.InvoiceNumber = 'test';
    mockDeclarationRequest.Declaration.Consignments.ShippingDetails.Invoices = [
      mockDHLEInvoice,
    ];
    mockPickupFile.hawb = 'mockAirwaybillNumber';
    mockReturnRequest.declarationRequest = mockDeclarationRequest;
    mockReturnRequest.pickupFile = mockPickupFile;
    mockOrderAggregate.direction = Direction.Return;
    mockOrderAggregate.returns = [mockReturnRequest];

    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(mockOrderAggregate);

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).not.toBeCalled();
    expect(mockOrderAggregate.submitAmendment).toBeCalled();
    expect(mockOrderAggregate.commit).toBeCalledTimes(1);
  });

  it('should error - no declaration request found (return)', async () => {
    mockToAmendInvoice.invoiceNumber = 'test';
    mockDHLEInvoice.InvoiceNumber = 'test';
    mockDeclarationRequest.Declaration.Consignments.ShippingDetails.Invoices = [
      mockDHLEInvoice,
    ];
    mockPickupFile.hawb = 'mockAirwaybillNumber';
    mockReturnRequest.declarationRequest = undefined;
    mockReturnRequest.pickupFile = mockPickupFile;
    mockOrderAggregate.direction = Direction.Return;
    mockOrderAggregate.returns = [mockReturnRequest];

    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(mockOrderAggregate);

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).toBeCalled();
    expect(mockOrderAggregate.submitAmendment).not.toBeCalled();
    expect(mockOrderAggregate.commit).toBeCalledTimes(1);
  });

  it('should error - found no invoice to amend', async () => {
    mockToAmendInvoice.invoiceNumber = 'wrongNumber';
    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(mockOrderAggregate);
    mockOrderAggregate.order.invoices = [mockToAmendInvoice];

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).toBeCalled();
    expect(mockOrderAggregate.submitAmendment).not.toBeCalled();
    expect(mockOrderAggregate.commit).toBeCalledTimes(1);
  });

  it('should error - invoice not found on declaration request (outbound)', async () => {
    mockToAmendInvoice.invoiceNumber = 'test';
    mockDHLEInvoice.InvoiceNumber = 'test2';
    mockDeclarationRequest.Declaration.Consignments.ShippingDetails.Invoices = [
      mockDHLEInvoice,
    ];
    mockOrderAggregate.declarationRequest = mockDeclarationRequest;
    mockOrderAggregate.direction = Direction.Outbound;
    mockOrderAggregate.order.invoices = [mockToAmendInvoice];

    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(mockOrderAggregate);

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).toBeCalled();
    expect(mockOrderAggregate.submitAmendment).not.toBeCalled();
    expect(mockOrderAggregate.commit).toBeCalledTimes(1);
  });

  it('should error - invoice not found on declaration request (inbound)', async () => {
    mockToAmendInvoice.invoiceNumber = 'test';
    mockDHLEInvoice.InvoiceNumber = 'test2';
    mockDeclarationRequest.Declaration.Consignments.ShippingDetails.Invoices = [
      mockDHLEInvoice,
    ];
    mockPickupFile.hawb = 'mockAirwaybillNumber';
    mockReturnRequest.declarationRequest = mockDeclarationRequest;
    mockReturnRequest.pickupFile = mockPickupFile;
    mockOrderAggregate.direction = Direction.Return;
    mockOrderAggregate.returns = [mockReturnRequest];

    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(mockOrderAggregate);

    await commandHandler.execute(command);
    expect(aggregateRepo.getById).toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).toBeCalled();
    expect(mockOrderAggregate.submitAmendment).not.toBeCalled();
    expect(mockOrderAggregate.commit).toBeCalledTimes(1);
  });

  it('should error - aggregate missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    const command: CreateAmendmentFromDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      ecomBusinessCode: aggregateKey.ecomCode,
      invoiceNumber: 'test',
      airwayBillNumber: 'mockAirwaybillNumber',
    };

    await expect(commandHandler.execute(command)).rejects.toThrow();
    expect(mockOrderAggregate.submitAmendment).not.toBeCalled();
    expect(mockOrderAggregate.addErrorEvent).not.toBeCalled();
    expect(aggregateRepo.getById).toBeCalled();
  });
});
