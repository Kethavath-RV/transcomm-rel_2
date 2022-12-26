import { OrderStatus } from '@prisma/client';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { CheckPointFile, Declaration, Invoice } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { DfCheckpointFileReceivedEvent } from '../impl/df-checkpointfile-received.event';
import { DfCheckpointFileReceivedHandler } from './df-checkpointfile-received.handler';
import { Logger } from '@nestjs/common';
import { ViewsService } from 'aggregates/orders/views/views.service';

describe('df checkpoint file event handler tests', () => {
  let eventHandler: DfCheckpointFileReceivedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const mockInvoice = Mock<Invoice>();
  const mockDeclaration = Mock<Declaration>();
  const aggregate = Mock<OrderAggregate>();
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DfCheckpointFileReceivedHandler,
        {
          provide: CommandBus,
          useValue: Mock<CommandBus>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    eventHandler = module.get<DfCheckpointFileReceivedHandler>(
      DfCheckpointFileReceivedHandler,
    );

    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);

    commandBus = module.get<CommandBus>(CommandBus);
    viewService = module.get<ViewsService>(ViewsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle create order succesfully', async () => {
    const checkpoint = Mock<CheckPointFile>();
    const event = new DfCheckpointFileReceivedEvent('test', checkpoint);
    aggregate.status = OrderStatus.Submitted;
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should handle call invoke update exit confirmation', async () => {
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'far away (you would not know it)';
    const event = new DfCheckpointFileReceivedEvent('test', checkpoint);
    aggregate.status = OrderStatus.Submitted;
    mockDeclaration.clearanceStatus = "Cleared"
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];
    mockDeclaration.declarationType = "303"

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it('should not call invoke update exit confirmation if (AUH)', async () => {
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'AUH';
    const event = new DfCheckpointFileReceivedEvent('test', checkpoint);
    aggregate.status = OrderStatus.Submitted;
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should not call invoke update exit confirmation if (DXB)', async () => {
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'DXB';
    const event = new DfCheckpointFileReceivedEvent('test', checkpoint);
    aggregate.status = OrderStatus.Submitted;
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should not call invoke update exit confirmation if (SHJ)', async () => {
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'SHJ';
    const event = new DfCheckpointFileReceivedEvent('test', checkpoint);
    aggregate.status = OrderStatus.Submitted;
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should error no aggregate', async () => {
    const checkpoint = Mock<CheckPointFile>();
    const event = new DfCheckpointFileReceivedEvent('test', checkpoint);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow(
      'No orderaggregate found for orderId: ' + event.aggregateId,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should error wrong status', async () => {
    const aggregateId = 'test';
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'SHJ';
    const event = new DfCheckpointFileReceivedEvent(aggregateId, checkpoint);
    aggregate.status = OrderStatus.ReturnReceipt;
    aggregate.id = aggregateId;
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    await expect(eventHandler.handle(event)).rejects.toThrow(
      `Orderaggregate ${aggregateId} is not Submitted or In Transit`,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should error no invoices present', async () => {
    const aggregateId = 'test';
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'SHJ';
    const event = new DfCheckpointFileReceivedEvent(aggregateId, checkpoint);
    aggregate.status = OrderStatus.Submitted;
    aggregate.id = aggregateId;
    mockInvoice.declarations = [];
    aggregate.order.invoices = [];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    await expect(eventHandler.handle(event)).rejects.toThrow(
      `Orderaggregate ${aggregateId} does not have an invoice with at least one declaration`,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should error no declarations present', async () => {
    const aggregateId = 'test';
    const checkpoint = Mock<CheckPointFile>();
    checkpoint.eventCode = 'DF';
    checkpoint.destination = 'SHJ';
    const event = new DfCheckpointFileReceivedEvent(aggregateId, checkpoint);
    aggregate.status = OrderStatus.Submitted;
    aggregate.id = aggregateId;
    mockInvoice.declarations = [];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    await expect(eventHandler.handle(event)).rejects.toThrow(
      `Invoice ${mockInvoice.invoiceNumber} does not have a declaration`,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });
});
