import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { DHLEDeclarationRequest, Direction, Movement } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { mockDeep } from 'jest-mock-extended';
import Mock from 'jest-mock-extended/lib/Mock';
import { DeclarationRequestReceivedEvent } from '../impl/declaration-request-received';
import { DeclarationRequestReceivedEventHandler } from './declaration-request-received.handler';

describe('Declaration request received event handler', () => {
  let eventHandler: DeclarationRequestReceivedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  let commandBus: CommandBus;
  const aggregate = Mock<OrderAggregate>();
  const mockMovementData = Mock<Movement>();
  const mockDeclarationRequest = mockDeep<DHLEDeclarationRequest>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeclarationRequestReceivedEventHandler,
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
          useValue: Mock<ViewsService>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());
    eventHandler = module.get<DeclarationRequestReceivedEventHandler>(
      DeclarationRequestReceivedEventHandler,
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

  it('should handle declaration request succesfully and call smart contract', async () => {
    aggregate.readyForManualAmendment = false;
    aggregate.movementData = mockMovementData;
    aggregate.returns = [];
    aggregate.direction = Direction.Outbound;
    aggregate.submitOrderMethodInvoked = true;
    const event = new DeclarationRequestReceivedEvent(
      'mockAggregateId',
      mockDeclarationRequest,
    );
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it('should handle declaration request succesfully and invoke amendment', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.readyForManualAmendment = true;
    const event = new DeclarationRequestReceivedEvent(
      'mockAggregateId',
      mockDeclarationRequest,
    );
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it('should fail to invoke amendment (no invoice)', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.readyForManualAmendment = true;
    mockDeclarationRequest.Declaration.Consignments.ShippingDetails.Invoices =
      [];
    const event = new DeclarationRequestReceivedEvent(
      'mockAggregateId',
      mockDeclarationRequest,
    );
    await expect(eventHandler.handle(event)).rejects.toThrow(
      `No invoiceNumber found in incoming Declaration Request: undefined`,
    );
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should handle declaration request succesfully but no smart contract call (no submit order)', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.movementData = mockMovementData;
    aggregate.returns = [];
    aggregate.direction = Direction.Outbound;
    aggregate.submitOrderMethodInvoked = false;
    aggregate.readyForManualAmendment = false;
    const event = new DeclarationRequestReceivedEvent(
      'mockAggregateId',
      mockDeclarationRequest,
    );
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });

  it('should error no aggregate', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    const event = new DeclarationRequestReceivedEvent(
      'mockAggregateId',
      mockDeclarationRequest,
    );
    await expect(eventHandler.handle(event)).rejects.toThrow(
      'No orderaggregate found for orderId: ' + event.aggregateId,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });
});
