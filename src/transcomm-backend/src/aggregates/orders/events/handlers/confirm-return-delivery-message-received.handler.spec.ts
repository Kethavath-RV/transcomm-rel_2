import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { ConfirmReturnDelivery } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ConfirmReturnDeliveryMessageReceivedEvent } from '../impl/confirmreturndeliverymessagereceived.event';
import { ConfirmReturnDeliveryMessageReceivedEventHandler } from './confirm-return-delivery-message-received.handler';

describe('confirm return delivery message recieved event tests', () => {
  let eventHandler: ConfirmReturnDeliveryMessageReceivedEventHandler;
  let aggregateRepo: AggregateRepository;
  let viewService: ViewsService;
  const aggregate = Mock<OrderAggregate>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmReturnDeliveryMessageReceivedEventHandler,
        {
          provide: ViewsService,
          useValue: Mock<ViewsService>(),
        },
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    eventHandler = module.get<ConfirmReturnDeliveryMessageReceivedEventHandler>(
      ConfirmReturnDeliveryMessageReceivedEventHandler,
    );

    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    viewService = module.get<ViewsService>(ViewsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('should handle amendment succesfully', async () => {
    const returnDelivery: ConfirmReturnDelivery = {
      dateOfReceivingBackGoods: '',
      ecomBusinessCode: '',
      gatePasses: [
        {
          ActualMovingInDate: new Date().toISOString(),
          gatePassDirection: '',
          gatePassNumber: '',
        },
      ],
      invoiceNumber: '',
      kvp: [],
      lineItems: [],
      orderNumber: '',
      returnRequestNo: '',
      transportDocNo: '',
      transportProviderCode: '',
    };
    const event = new ConfirmReturnDeliveryMessageReceivedEvent(
      'test',
      'test',
      'test',
      'test',
      returnDelivery,
    );
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    await eventHandler.handle(event);
    expect(viewService.HydrateViews).toBeCalled();
  });
});
