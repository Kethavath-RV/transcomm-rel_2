import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Movement, SubmitOrder } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { OrderUpdatedEvent } from '../impl/order-updated.event';
import { OrderUpdatedHandler } from './order-updated.handler';

describe('order updated event handler tests', () => {
  let eventHandler: OrderUpdatedHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderUpdatedHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ]
    }).compile();
    module.useLogger(Mock<Logger>());

    eventHandler = module.get<OrderUpdatedHandler>(
      OrderUpdatedHandler,
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

  it('should handle update order succesfully', async () => {
    const request = Mock<SubmitOrder>();
    request.orderDate = "";
    request.actionDate = "";
    const movement = Mock<Movement>()
    aggregate.movementData = movement;
    aggregate.order.invoices = [];
    aggregate.order.orderDate = "";
    aggregate.order.orderDate = '';
    aggregate.orderDate = '';

    const event = new OrderUpdatedEvent('test', request);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });

  it('should error no aggregate', async () => {
    const request = Mock<SubmitOrder>();
    aggregate.movementData = {} as Movement;
    aggregate.order.invoices = [];
    aggregate.order.orderDate = "";

    const event = new OrderUpdatedEvent('test', request);
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
    await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
  });
});