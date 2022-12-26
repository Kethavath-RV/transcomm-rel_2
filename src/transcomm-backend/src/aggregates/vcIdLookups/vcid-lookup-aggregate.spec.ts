import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LookupType } from 'core';
import {
  AggregateRepository,
  EventStore,
  StorableEvent,
  StoreEventBus,
  StoreEventPublisher,
  ViewEventBus,
} from 'event-sourcing';
import { mock } from 'jest-mock-extended';
import { CreateVcIdLookupCommandHandler } from './commands/handlers/create-vcid-lookup.handler';
import { PerformVcIdLookupCommandHandler } from './commands/handlers/perform-vcid-lookup.handler';
import { CreateVcIdLookupCommand } from './commands/impl/create-vcId-lookup';
import { PerformVcIdLookupCommand } from './commands/impl/perform-lookup';
import { IncomingErrorReceivedEvent } from './events/impl/incoming-error-received.event';
import { IncomingOrderProcessedEvent } from './events/impl/incoming-order-processed.event';
import { IncomingOrderReceivedEvent } from './events/impl/incoming-order-received.event';
import { VcIdLookupAggregate } from './vcid-lookup-aggregate';

const vcId = 'mock-vcid-1';
const orderId = 'mock-orderid-1';
const ecomCode = 'test-ecom-1';
const vcIdError = 'mock-vcid-error'
describe('VcIdLookupAggregate', () => {
  // The following is basically an in memory event store because most commands need previous events to be properly tested
  const storedEvents: StorableEvent[] = [];
  let eventsStoredBeforeTest = 0;
  const eventStore = mock<EventStore>();
  jest
    .spyOn(eventStore, 'getEvents')
    .mockImplementation(async (aggregate, aggregateId) => {
      expect(aggregate).toBe('vcIdLookup');
      return storedEvents.filter((e) => e.aggregateId === aggregateId);
    });
  jest.spyOn(eventStore, 'storeEvent').mockImplementation(async (event) => {
    storedEvents.push(event);
  });
  //

  // Next we instantiate some services needed for event sourcing, most of them cannot be mocked
  const viewEventBus = mock<ViewEventBus>();
  const storeEventBus = new StoreEventBus(viewEventBus, eventStore);
  const storeEventPublisher: StoreEventPublisher = new StoreEventPublisher(
    storeEventBus,
  );
  const aggregateRepository = new AggregateRepository(
    eventStore,
    storeEventPublisher,
  );
  //

  beforeAll(async () => {
    // Provide a logger wihout output
    await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: {
            log: jest.fn(() => {
              return;
            }),
            error: jest.fn(() => {
              return;
            }),
          },
        },
      ],
    }).compile();
  });

  beforeEach(async () => {
    eventsStoredBeforeTest = eventStore.storeEvent.mock.calls.length;
  });

  // Tests

  it('can create lookup', async () => {
    const createvcIdLookupCommandHandler =
      new CreateVcIdLookupCommandHandler(
        storeEventPublisher,
        aggregateRepository,
      );
    const createvcIdLookupCommand =
      new CreateVcIdLookupCommand(
        vcId,
        orderId,
        ecomCode,
        LookupType.Order,
        'order',
      );
    await createvcIdLookupCommandHandler.execute(
      createvcIdLookupCommand,
    );

    expect(eventStore.getEvents).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalled();

    const aggregate = await aggregateRepository.getById(
      VcIdLookupAggregate,
      'vcIdLookup',
      vcId,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.orderId).toBe(orderId);
    expect(aggregate?.ecomCode).toBe(ecomCode);
    expect(aggregate?.isProcessed).toBe(false);
    expect(storedEvents[storedEvents.length - 1]).toBeInstanceOf(
      IncomingOrderReceivedEvent,
    );
  });

  it('can perform lookup', async () => {
    const performvcIdLookupCommandHandler =
      new PerformVcIdLookupCommandHandler(aggregateRepository);
    const performvcIdLookupCommand =
      new PerformVcIdLookupCommand(vcId);
    await performvcIdLookupCommandHandler.execute(
      performvcIdLookupCommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(
      eventsStoredBeforeTest + 1,
    );

    const aggregate = await aggregateRepository.getById(
      VcIdLookupAggregate,
      'vcIdLookup',
      vcId,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.orderId).toBe(orderId);
    expect(aggregate?.ecomCode).toBe(ecomCode);
    expect(aggregate?.isProcessed).toBe(true);
    expect(storedEvents[storedEvents.length - 1]).toBeInstanceOf(
      IncomingOrderProcessedEvent,
    );
  });

  it('Nonexisting lookup does not create new event', async () => {
    const nonexistingVcId = 'nonexisting-vcid';
    const performvcIdLookupCommandHandler =
      new PerformVcIdLookupCommandHandler(aggregateRepository);
    const performvcIdLookupCommand =
      new PerformVcIdLookupCommand(nonexistingVcId);
    await performvcIdLookupCommandHandler
      .execute(performvcIdLookupCommand)
      .catch(() => {
        return;
      });

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(eventsStoredBeforeTest);
  });

  it('can create error lookup', async () => {
    const createvcIdLookupCommandHandler =
      new CreateVcIdLookupCommandHandler(
        storeEventPublisher,
        aggregateRepository,
      );
    const createvcIdLookupCommand =
      new CreateVcIdLookupCommand(
        vcIdError,
        orderId,
        ecomCode,
        LookupType.Error,
        'test',
        'commandname',
        'errorcode',
        'errorMessage'
      );
    await createvcIdLookupCommandHandler.execute(
      createvcIdLookupCommand,
    );

    expect(eventStore.getEvents).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalled();

    const aggregate = await aggregateRepository.getById(
      VcIdLookupAggregate,
      'vcIdLookup',
      vcIdError,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.orderId).toBe(orderId);
    expect(aggregate?.ecomCode).toBe(ecomCode);
    expect(aggregate?.commandName).toBe('commandname');
    expect(aggregate?.errorCode).toBe('errorcode');
    expect(aggregate?.isProcessed).toBe(false);
    expect(storedEvents[storedEvents.length - 1]).toBeInstanceOf(
      IncomingErrorReceivedEvent,
    );
  });
});
