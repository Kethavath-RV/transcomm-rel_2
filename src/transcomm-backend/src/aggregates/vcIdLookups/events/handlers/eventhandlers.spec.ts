import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { LookupType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { mock } from 'jest-mock-extended';
import { IncomingErrorProcessedEvent } from '../impl/incoming-error-processed.event';
import { IncomingOrderProcessedEvent } from '../impl/incoming-order-processed.event';
import { IncomingOrderProcessedHandler } from './incoming-order-processed.handler';

const vcId = 'test-vcid-1';
const orderId = 'test-orderid-1';
const ecomBusinessCode = 'test-ecom-1';

describe('EventHandlers for vcdIdOrderIdLookup aggregate', () => {
  let eventHandler: IncomingOrderProcessedHandler;
  let commandBus: CommandBus;

  beforeAll(async () => {
    // Provide a logger wihout output
    const module = await Test.createTestingModule({
      providers: [
        IncomingOrderProcessedHandler,
        {
          provide: AggregateRepository,
          useValue: mock<AggregateRepository>(),
        },
        {
          provide: CommandBus,
          useValue: mock<CommandBus>()
        },
      ],
    })
      .setLogger(mock<Logger>())
      .compile();

    eventHandler = module.get<IncomingOrderProcessedHandler>(IncomingOrderProcessedHandler);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  // Tests
  it('should be defined', () => {
    expect(eventHandler).toBeDefined();
  });

  it('IncomingOrderProcessedEvent triggers ProcessNotificationProcessedCommand', async () => {
    const event = new IncomingOrderProcessedEvent(
      vcId,
      orderId,
      ecomBusinessCode,
      LookupType.Order,
    );

    await eventHandler.handle(event);
    expect(commandBus.execute).toBeCalled();
  });

  it('IncomingErrorProcessedEvent does not trigger ProcessNotificationProcessedCommand', async () => {
    const event = new IncomingErrorProcessedEvent(
      vcId,
      orderId,
      ecomBusinessCode,
      LookupType.Error,
    );

    await eventHandler.handle(event);
    expect(commandBus.execute).not.toBeCalled();
  });

  it('IncomingOrderProcessedEvent does not trigger ProcessNotificationProcessedCommand if lookup type is error', async () => {
    const event = new IncomingOrderProcessedEvent(
      vcId,
      orderId,
      ecomBusinessCode,
      LookupType.Error,
    );

    await eventHandler.handle(event);
    expect(commandBus.execute).not.toBeCalled();
  });
});
