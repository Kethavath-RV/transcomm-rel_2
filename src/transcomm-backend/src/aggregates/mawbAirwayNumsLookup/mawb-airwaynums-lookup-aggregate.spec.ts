import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DetailMovement } from 'core';
import {
  AggregateRepository,
  EventStore,
  StorableEvent,
  StoreEventBus,
  StoreEventPublisher,
  ViewEventBus,
} from 'event-sourcing';
import { mock } from 'jest-mock-extended';
import Mock from 'jest-mock-extended/lib/Mock';
import { detailMovement } from 'models/mocks.models';
import { CreateMawbToAirwaynumsLookupCommandHandler } from './commands/handlers/create-mawb-airwaybillnums-lookup.handler';
import { PerformMawbAirwayNumsLookupCommandCommandHandler } from './commands/handlers/perform-mawb-lookup.handler';
import { CreateMawbToAirwaynumsLookupCommand } from './commands/impl/create-mawb-airwaynums-lookup';
import { PerformMawbAirwayNumsLookupCommand } from './commands/impl/perform-mawb-lookup';
import { IncomingDetailMovementFileEvent } from './events/impl/incoming-detail-movement-file.event';
import { MawbToAirwayNumsLookupCreatedEvent } from './events/impl/mawb-to-airwaynums-lookup-created.event';
import { MawbToAirwayNumsLookupAggregate } from './mawb-airwaynums-lookup-aggregate';

const mawbNumber = detailMovement.mawbNumber;
const airwayBillNo1 = detailMovement.airwayBillNumber;
const airwayBillNumbers = [airwayBillNo1, 'airwayBillNo2', 'airwayBillNo3'];

describe('MawbToAirwayNumsLookupAggregate', () => {
  // The following is basically an in memory event store because most commands need previous events to be properly tested
  const storedEvents: StorableEvent[] = [];
  let eventsStoredBeforeTest = 0;
  const eventStore = mock<EventStore>();
  jest
    .spyOn(eventStore, 'getEvents')
    .mockImplementation(async (aggregate, aggregateId) => {
      expect(aggregate).toBe('mawbToAirwayIdLookup');
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
    const module = await Test.createTestingModule({
      providers: [
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

  });

  beforeEach(async () => {
    eventsStoredBeforeTest = eventStore.storeEvent.mock.calls.length;
  });

  // Tests

  it('can create lookup', async () => {
    const createMawbToAirwaynumsLookupCommandHandler =
      new CreateMawbToAirwaynumsLookupCommandHandler(
        storeEventPublisher,
        aggregateRepository,
      );
    const createMawbToAirwaynumsLookupCommand =
      new CreateMawbToAirwaynumsLookupCommand(mawbNumber, airwayBillNumbers);
    await createMawbToAirwaynumsLookupCommandHandler.execute(
      createMawbToAirwaynumsLookupCommand,
    );

    expect(eventStore.getEvents).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalled();

    const aggregate = await aggregateRepository.getById(
      MawbToAirwayNumsLookupAggregate,
      'mawbToAirwayIdLookup',
      mawbNumber,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.airwayBillNumbers).toBe(airwayBillNumbers);
    expect(aggregate?.mawb).toBe(mawbNumber);
    expect(storedEvents[storedEvents.length - 1]).toBeInstanceOf(
      MawbToAirwayNumsLookupCreatedEvent,
    );
  });

  it('can perform lookup', async () => {
    const performMawbAirwayNumsLookupCommandHandler =
      new PerformMawbAirwayNumsLookupCommandCommandHandler(aggregateRepository);
    const performMawbAirwayNumsLookupCommand =
      new PerformMawbAirwayNumsLookupCommand(mawbNumber, detailMovement);
    await performMawbAirwayNumsLookupCommandHandler.execute(
      performMawbAirwayNumsLookupCommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(
      eventsStoredBeforeTest + 1,
    );

    const aggregate = await aggregateRepository.getById(
      MawbToAirwayNumsLookupAggregate,
      'mawbToAirwayIdLookup',
      mawbNumber,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.airwayBillNumbers).toBe(airwayBillNumbers);
    expect(aggregate?.mawb).toBe(mawbNumber);
    expect(storedEvents[storedEvents.length - 1]).toBeInstanceOf(
      IncomingDetailMovementFileEvent,
    );
  });

  it('Nonexisting lookup does not create new event', async () => {
    const nonexistingMawb = 'nonexisting-mawbNumber';
    const performMawbAirwayNumsLookupCommandHandler =
      new PerformMawbAirwayNumsLookupCommandCommandHandler(aggregateRepository);
    const performMawbAirwayNumsLookupCommand =
      new PerformMawbAirwayNumsLookupCommand(nonexistingMawb, detailMovement);
    await performMawbAirwayNumsLookupCommandHandler
      .execute(performMawbAirwayNumsLookupCommand)
      .catch(() => {
        return;
      });

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(eventsStoredBeforeTest);

    const aggregate = await aggregateRepository.getById(
      MawbToAirwayNumsLookupAggregate,
      'mawbToAirwayIdLookup',
      nonexistingMawb,
    );

    expect(aggregate).toBe(null);
  });

  it('Nonexisting airwayBillNumber does not create new event', async () => {
    const nonexistingAirwayBillNumber = 'nonexisting-airwaybill-number';
    const detailMovementWithNonexistingAirwayBillNo: DetailMovement = {
      airwayBillNumber: nonexistingAirwayBillNumber,
      handlingUnitNumber: '',
      consigneeCountryCode: '',
      incoterm: '',
      item: { unitOfMeasure: '' },
      mawbNumber: mawbNumber,
      shipmentActualWeight: 0,
      shipmentDeclaredVolumeWeight: 0,
      shipmentDestination: '',
      shipmentOrigin: '',
      shipmentOriginCountry: '',
      shipmentTotalVolumeMetricWeight: 0,
      shipmentWeight: 0,
      shipperRef: [],
      totalPiecesInShipment: 0,
    };
    const performMawbAirwayNumsLookupCommandHandler =
      new PerformMawbAirwayNumsLookupCommandCommandHandler(aggregateRepository);
    const performMawbAirwayNumsLookupCommand =
      new PerformMawbAirwayNumsLookupCommand(
        mawbNumber,
        detailMovementWithNonexistingAirwayBillNo,
      );
    await performMawbAirwayNumsLookupCommandHandler
      .execute(performMawbAirwayNumsLookupCommand)
      .catch(() => {
        return;
      });

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(eventsStoredBeforeTest);
  });
});
