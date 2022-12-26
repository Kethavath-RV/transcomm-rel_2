import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DHLEDeclarationRequest } from 'core';
import {
  AggregateRepository,
  EventStore,
  StorableEvent,
  StoreEventBus,
  StoreEventPublisher,
  ViewEventBus,
} from 'event-sourcing';
import { mock, mockDeep } from 'jest-mock-extended';
import { detailMovement, mockMasterMovement } from 'models/mocks.models';
import { AirwayNumToOrderIdLookupAggregate } from './airwaynum-orderid-lookup-aggregate';
import { CreateAirwayBillToOrderIdLookupHandler } from './commands/handlers/create-airwaybillno-orderid-lookup.handler';
import { PerformDetailToOrderIdLookupCommandHandler } from './commands/handlers/perform-detail-lookup.handler';
import { PerformAirwayBillNoToOrderIdLookupDHLECommandHandler } from './commands/handlers/perform-dhle-lookup.handler';
import { PerformAirwayBillNoToOrderIdLookupMovementCommandHandler } from './commands/handlers/perform-movement-lookup.handler';
import { CreateAirwayBillToOrderIdLookupCommand } from './commands/impl/create-airwaybillno-orderid-lookup';
import { PerformDetailToOrderIdLookupCommand } from './commands/impl/perform-detail-lookup';
import { PerformAirwayBillNoToOrderIdLookupDHLECommand } from './commands/impl/perform-lookup-dhle';
import { PerformAirwayBillNoToOrderIdLookupMovementCommand } from './commands/impl/perform-lookup-movement';
import { IncomingDeclarationRequestEvent } from './events/impl/incoming-declaration-request.event';
import { IncomingDetailMovementEvent } from './events/impl/incoming-detail-movement.event';
import { IncomingMasterMovementFileEvent } from './events/impl/incoming-master-movement-file.event';

// Mock data
const airwayBillNo = detailMovement.airwayBillNumber;
const orderId = 'test-order-1';
const ecomCode = 'test-ecom-1';
const mawbNumber = detailMovement.mawbNumber;

describe('AirwayNumOrderIdLookupAggregate', () => {
  // The following is basically an in memory event store because most commands need previous events to be properly tested
  const storedEvents: StorableEvent[] = [];
  let eventsStoredBeforeTest = 0;
  const eventStore = mock<EventStore>();
  jest
    .spyOn(eventStore, 'getEvents')
    .mockImplementation(async (aggregate, aggregateId) => {
      expect(aggregate).toBe('airwayToOrderIdLookup');
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
    const createAirwayBillToOrderIdLookupHandler =
      new CreateAirwayBillToOrderIdLookupHandler(
        storeEventPublisher,
        aggregateRepository,
      );
    const createAirwayBillToOrderIdLookupCommand =
      new CreateAirwayBillToOrderIdLookupCommand(
        airwayBillNo,
        orderId,
        ecomCode,
      );
    await createAirwayBillToOrderIdLookupHandler.execute(
      createAirwayBillToOrderIdLookupCommand,
    );

    expect(eventStore.getEvents).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalled();

    const aggregate = await aggregateRepository.getById(
      AirwayNumToOrderIdLookupAggregate,
      'airwayToOrderIdLookup',
      airwayBillNo,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.airWayBillId).toBe(airwayBillNo);
    expect(aggregate?.orderId).toBe(orderId);
    expect(aggregate?.ecomCode).toBe(ecomCode);
  });

  it('can lookup for order id with detail movement', async () => {
    const performDetailToOrderIdLookupCommandHandler =
      new PerformDetailToOrderIdLookupCommandHandler(aggregateRepository);
    const performDetailToOrderIdLookupCommand =
      new PerformDetailToOrderIdLookupCommand(airwayBillNo, detailMovement);
    await performDetailToOrderIdLookupCommandHandler.execute(
      performDetailToOrderIdLookupCommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(
      eventsStoredBeforeTest + 1,
    );

    const aggregate = await aggregateRepository.getById(
      AirwayNumToOrderIdLookupAggregate,
      'airwayToOrderIdLookup',
      airwayBillNo,
    );

    expect(aggregate?.airWayBillId).toBe(airwayBillNo);
    expect(aggregate?.orderId).toBe(orderId);

    const incomingDetailMovementEvent = storedEvents[
      storedEvents.length - 1
    ] as IncomingDetailMovementEvent;

    expect(incomingDetailMovementEvent).toBeDefined();
    expect(incomingDetailMovementEvent.orderId).toBe(orderId);
    expect(incomingDetailMovementEvent.ecomCode).toBe(ecomCode);
    expect(incomingDetailMovementEvent.movementFileData.mawbNumber).toBe(
      mawbNumber,
    );
    expect(incomingDetailMovementEvent.movementFileData.airwayBillNumber).toBe(
      airwayBillNo,
    );
  });

  it('can lookup for order id with declaration request', async () => {
    const declarationRequest = mockDeep<DHLEDeclarationRequest>();
    const performAirwayBillNoToOrderIdLookupDHLECommandHandler =
      new PerformAirwayBillNoToOrderIdLookupDHLECommandHandler(
        aggregateRepository,
      );
    const performAirwayBillNoToOrderIdLookupDHLECommand =
      new PerformAirwayBillNoToOrderIdLookupDHLECommand(
        airwayBillNo,
        declarationRequest,
      );
    await performAirwayBillNoToOrderIdLookupDHLECommandHandler.execute(
      performAirwayBillNoToOrderIdLookupDHLECommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(
      eventsStoredBeforeTest + 1,
    );

    const aggregate = await aggregateRepository.getById(
      AirwayNumToOrderIdLookupAggregate,
      'airwayToOrderIdLookup',
      airwayBillNo,
    );

    expect(aggregate?.airWayBillId).toBe(airwayBillNo);
    expect(aggregate?.orderId).toBe(orderId);

    const incomingDeclarationRequestEvent = storedEvents[
      storedEvents.length - 1
    ] as IncomingDeclarationRequestEvent;

    expect(incomingDeclarationRequestEvent).toBeDefined();
    expect(incomingDeclarationRequestEvent.orderId).toBe(orderId);
    expect(incomingDeclarationRequestEvent.ecomCode).toBe(ecomCode);
  });

  it('can lookup for order id with master movement', async () => {
    const performAirwayBillNoToOrderIdLookupCommandHandler =
      new PerformAirwayBillNoToOrderIdLookupMovementCommandHandler(
        aggregateRepository,
      );
    const performAirwayBillNoToOrderIdLookupCommand =
      new PerformAirwayBillNoToOrderIdLookupMovementCommand(
        airwayBillNo,
        mockMasterMovement,
      );
    await performAirwayBillNoToOrderIdLookupCommandHandler.execute(
      performAirwayBillNoToOrderIdLookupCommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(
      eventsStoredBeforeTest + 1,
    );

    const aggregate = await aggregateRepository.getById(
      AirwayNumToOrderIdLookupAggregate,
      'airwayToOrderIdLookup',
      airwayBillNo,
    );

    expect(aggregate?.airWayBillId).toBe(airwayBillNo);
    expect(aggregate?.orderId).toBe(orderId);
    expect(aggregate?.ecomCode).toBe(ecomCode);

    const incomingMasterMovementEvent = storedEvents[
      storedEvents.length - 1
    ] as IncomingMasterMovementFileEvent;

    expect(incomingMasterMovementEvent).toBeDefined();
    expect(incomingMasterMovementEvent.orderId).toBe(orderId);
    expect(incomingMasterMovementEvent.movementFileData.mawbNumber).toBe(
      mawbNumber,
    );
  });

  it('Nonexisting lookup does not create new event', async () => {
    const someOtherAirwayBillNumber = 'other-airwayBillNumber-1';
    const performAirwayBillNoToOrderIdLookupCommandHandler =
      new PerformAirwayBillNoToOrderIdLookupMovementCommandHandler(
        aggregateRepository,
      );
    const performAirwayBillNoToOrderIdLookupCommand =
      new PerformAirwayBillNoToOrderIdLookupMovementCommand(
        someOtherAirwayBillNumber,
        mockMasterMovement,
      );
    await performAirwayBillNoToOrderIdLookupCommandHandler
      .execute(performAirwayBillNoToOrderIdLookupCommand)
      .catch(() => {
        return;
      });

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(eventsStoredBeforeTest);
  });
});
