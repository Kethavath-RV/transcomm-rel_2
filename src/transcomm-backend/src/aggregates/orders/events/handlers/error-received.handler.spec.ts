import { OrderStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { Declaration, Invoice } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ErrorReceivedEvent } from '../impl/error-received.event';
import { ErrorReceivedEventHandler } from './error-received.handler';
import { BlessClientService } from 'bless/bless-client/bless-client.service';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { mockConfig } from 'bless/bless-client/__mocks__/configService.mock';

describe('error received event handler tests', () => {
  let eventHandler: ErrorReceivedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const mockInvoice = Mock<Invoice>();
  const mockDeclaration = Mock<Declaration>();
  const aggregate = Mock<OrderAggregate>();
  let blessService: BlessClientService;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorReceivedEventHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>()
        },
        {
          provide: ConfigService,
          useValue: mockConfig(),
        },
        {
          provide: CommandBus,
          useValue: Mock<CommandBus>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: BlessClientService,
          useValue: Mock<BlessClientService>(),
        },
      ],
    }).compile();
    eventHandler = module.get<ErrorReceivedEventHandler>(
      ErrorReceivedEventHandler,
    );

    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    commandBus = module.get<CommandBus>(CommandBus);
    blessService = module.get<BlessClientService>(BlessClientService);
    viewService = module.get<ViewsService>(ViewsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle create order succesfully', async () => {
    const event = new ErrorReceivedEvent(
      'test',
      'test',
      'test',
      'test',
      new Date(),
    );
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    aggregate.status = OrderStatus.Submitted;
    mockInvoice.declarations = [mockDeclaration];
    aggregate.order.invoices = [mockInvoice];

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
    expect(blessService.postError).toBeCalled();
    expect(commandBus.execute).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const event = new ErrorReceivedEvent(
      'test',
      'test',
      'test',
      'test',
      new Date(),
    );
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow(
      'No orderaggregate found for orderId: ' + event.aggregateId,
    );
    expect(viewService.HydrateViews).not.toBeCalled();
    expect(blessService.postError).not.toBeCalled();
    expect(commandBus.execute).not.toBeCalled();
  });
});
