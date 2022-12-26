import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { PrismaClientInitializationError } from '@prisma/client/runtime';
import { CreateOrderHandler } from 'aggregates/orders/commands/handlers/create-order.handler';
import { ProcessNotificationHandler } from 'aggregates/orders/commands/handlers/process-notification.handler';
import { ProcessPickupFileHandler } from 'aggregates/orders/commands/handlers/process-pickupfile.handler';
import { CreateOrderCommand } from 'aggregates/orders/commands/impl/create-order';
import { InvokeSubmitOrderMethodCommand } from 'aggregates/orders/commands/impl/invoke-submitorder-method';
import { ProcessNotificationProcessedCommand } from 'aggregates/orders/commands/impl/process-notification-processed';
import { ProcessPickupFileCommand } from 'aggregates/orders/commands/impl/process-pickupfile';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { ViewsService } from 'aggregates/orders/views/views.service';
import {
  Country,
  Currencies,
  FreeZoneCode,
  IncoTermCode,
  SubmitOrderInvoice,
  InvoiceType,
  ModeType,
  SubmitOrder,
  PaymentInstrumentType,
  CheckPointFile,
  CargoOwnership,
  LookupType,
  SubmitOrderReturnDetail,
} from 'core';
import {
  AggregateRepository,
  EventStore,
  StorableEvent,
  StoreEventBus,
  StoreEventPublisher,
  ViewEventBus,
} from 'event-sourcing';
import { mock } from 'jest-mock-extended';
import { NotificationProcessedReceivedEvent } from '../impl/notification-processed.event';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { NotificationProcessedHandler } from './notification-processed.handler';
import { OrderCreatedHandler } from './order-created.handler';

// Mock data
const orderId = 'test-order';
const ecomId = 'test-ecom-id';
const aggregateKey = new OrderAggregateKey(orderId, ecomId);
const invoiceId = 'test-invoice';
const billTo = 'Test person';

const mockInvoice: SubmitOrderInvoice = {
  invoiceNumber: invoiceId,
  freightCurrency: Currencies.ArubanGuilder,
  insuranceCurrency: Currencies.ArubanGuilder,
  invoiceDate: '',
  mode: ModeType.Final,
  cancellationReason: '',
  totalNoOfInvoicePages: 0,
  invoiceType: InvoiceType.Invoice,
  paymentInstrumentType: PaymentInstrumentType.BankTransfer,
  currency: Currencies.Afghani,
  incoTerm: IncoTermCode.CarriageInsurancePaidTo,
  exporterCode: '',
  FZCode: FreeZoneCode.AirportFreeZone,
  warehouseCode: '',
  cargoOwnership: CargoOwnership.SelfOwnership,
  brokerBusinessCode: '',
  logisticsSPBusinessCode: '',
  documents: [],
  returnDetail: {} as SubmitOrderReturnDetail,
  lineItems: [],
};

const mockOrder: SubmitOrder = {
  orderNumber: orderId,
  orderDate: '2021-08-28T17:59:27Z',
  ecomBusinessCode: ecomId,
  actionDate: '',
  billTo: billTo,
  billToAddress: {
    addressLine1: '',
    addressLine2: '',
    POBox: '',
    city: '',
    country: Country.Bahrain,
  },
  documents: [],
  invoices: [mockInvoice],
  mode: ModeType.Final,
};

const mockPickupFile: CheckPointFile = {
  eventCode: '',
  eventRemark: '',
  weight: 0,
  volumeWeight: 0,
  weightQualifier: '',
  shipperReference: orderId,
  hawb: '',
  ETADateTime: '',
  eventDate: '2021-08-28T17:59:27Z',
  eventGMT: '',
  destination: '',
  origin: '',
  numberOfPackages: 0,
  shipmentCurrency: '',
  shipmentDeclaredValue: '',
  ecomBusinessCode: ecomId,
};

describe('EventHandlers for order aggregate', () => {
  // The following is basically an in memory event store because most commands need previous events to be properly tested
  const storedEvents: StorableEvent[] = [];
  const eventStore = mock<EventStore>();
  jest
    .spyOn(eventStore, 'getEvents')
    .mockImplementation(async (aggregate, aggregateId) => {
      expect(aggregate).toBe('order');
      return storedEvents.filter((e) => e.aggregateId === aggregateId);
    });
  jest.spyOn(eventStore, 'storeEvent').mockImplementation(async (event) => {
    storedEvents.push(event);
  });

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
  const configService = mock<ConfigService>();
  jest.spyOn(configService, 'get').mockImplementation((propertyPath) => {
    expect(propertyPath).toBeDefined();
    return 'mysql://root:test-password123@nonexisting-db:1000/order_view';
  });
  const commandBus = mock<CommandBus>();

  beforeAll(async () => {
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
    // Run multiple commands to create a meaningful aggregate and events to use for event handler tests
    const createOrderCommandHandler = new CreateOrderHandler(
      storeEventPublisher,
      aggregateRepository,
    );
    await createOrderCommandHandler.execute(
      new CreateOrderCommand(aggregateKey, orderId, mockOrder),
    );
    const processNotificationHandler = new ProcessNotificationHandler(
      aggregateRepository,
    );
    await processNotificationHandler.execute(
      new ProcessNotificationProcessedCommand(
        aggregateKey,
        orderId,
        LookupType.Order,
        '',
      ),
    );
    const processPickupFileCommandHandler = new ProcessPickupFileHandler(
      aggregateRepository,
    );
    mockPickupFile.shipperReference = orderId;
    await processPickupFileCommandHandler.execute(
      new ProcessPickupFileCommand(aggregateKey, mockPickupFile),
    );
  });

  // Tests

  it('can handle order created event', async () => {
    const orderCreatedEvent = storedEvents.filter(
      (x) => x.eventType === OrderCreatedEvent.name,
    )[0] as OrderCreatedEvent;
    const orderCreatedEventHandler = new OrderCreatedHandler(
      aggregateRepository,
      mock<ViewsService>(),
    );
    await orderCreatedEventHandler.handle(orderCreatedEvent).catch((e) => {
      // Expect a PrismaClientInitializationError error since this means that the event handler went up to trying to create a transaction
      expect(e).toBeInstanceOf(PrismaClientInitializationError);
    });
  });

  it('NotificationProcessEvent should trigger InvokeSubmitOrderCommand', async () => {
    jest.spyOn(commandBus, 'execute').mockImplementation(async (command) => {
      const invokeSubmitOrderCommand =
        command as InvokeSubmitOrderMethodCommand;
      expect(command).toBeInstanceOf(InvokeSubmitOrderMethodCommand);
      expect(invokeSubmitOrderCommand.orderNumber).toBe(orderId);
    });
    const notificationProcessedEvent = storedEvents.filter(
      (x) => x.eventType === NotificationProcessedReceivedEvent.name,
    )[0] as NotificationProcessedReceivedEvent;
    const notificationProcessedHandler = new NotificationProcessedHandler(
      commandBus,
      aggregateRepository,
      mock<ViewsService>(),
    );
    await notificationProcessedHandler
      .handle(notificationProcessedEvent)
      .catch((e) => {
        // Expect a PrismaClientInitializationError error since this means that the event handler went up to trying to create a transaction
        expect(e).toBeInstanceOf(PrismaClientInitializationError);
      });
  });
});
