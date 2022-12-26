import {
  Amendment,
  CustomsStatus,
  Declaration,
  DocumentTrackingData,
  DocumentType,
  LookupType,
  OrderStatus,
  UserResponse,
} from 'core';
import { DatagenClient } from 'datagen-client/datagen-client';
import {
  AggregateRepository,
  EventStore,
  StorableEvent,
  StoreEventBus,
  StoreEventPublisher,
  ViewEventBus,
} from 'event-sourcing';
import { mock } from 'jest-mock-extended';
import { CreateAmendmentCommand } from './commands/impl/create-amendment';
import { CreateOrderCommand } from './commands/impl/create-order';
import { InvokeInitiateDeclarationCallMethodCommand } from './commands/impl/invoke-initiatedeclarationcall-method';
import { InvokeSubmitOrderMethodCommand } from './commands/impl/invoke-submitorder-method';
import { InvokeUpdateTransportInfoMethodCommand } from './commands/impl/invoke-updatetransportinfo-method';
import { LockOrderCommand } from './commands/impl/lock-order';
import { ProcessDetailMovementFileCommand } from './commands/impl/process-detail-movement-file';
import { ProcessMasterMovementFileCommand } from './commands/impl/process-master-movement-file';
import { ProcessNotificationProcessedCommand } from './commands/impl/process-notification-processed';
import { ProcessPickupFileCommand } from './commands/impl/process-pickupfile';
import { UnlockOrderCommand } from './commands/impl/unlock-order';
import { OrderAggregate } from './order-aggregate';
import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { ProcessNotificationHandler } from './commands/handlers/process-notification.handler';
import { ProcessPickupFileHandler } from './commands/handlers/process-pickupfile.handler';
import { CreateAmendmentCommandHandler } from './commands/handlers/create-amendment.handler';
import { LockOrderCommandHandler } from './commands/handlers/lock-order.handler';
import { UnlockOrderCommandHandler } from './commands/handlers/unlock-order.handler';
import { InvokeSubmitOrderMethodHandler } from './commands/handlers/invoke-submitorder-method.handler';
import { ProcessMasterMovementFileHandler } from './commands/handlers/process-master-movementfile.handler';
import { ProcessDetailMovementHandler } from './commands/handlers/process-detail-movementfile.handler';
import { InvokeUpdateTransportInfoMethodHandler } from './commands/handlers/invoke-updatetransportinfo-method.handler';
import { InvokeInitiateDeclarationCallMethodCommandHandler } from './commands/handlers/invoke-initiatedeclarationcall-method.handler';
import {
  cancelOrder,
  detailMovement,
  mockMasterMovement,
  mockPickupFile,
  mockSubmitOrder,
} from 'models/mocks.models';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CancelOrderCommand } from './commands/impl/cancel-order';
import { CancelOrderHandler } from './commands/handlers/cancel-order.handler';
import { OrderAggregateKey } from './order-aggregate-key';
import { ApplicationError } from '../../models/error.model';

const orderId = mockSubmitOrder.orderNumber;
const ecomNumber = mockSubmitOrder.ecomBusinessCode;
const aggregateKey = new OrderAggregateKey(orderId, ecomNumber);
const invoiceId = mockSubmitOrder.invoices[0].invoiceNumber;
const invoiceNumber = mockSubmitOrder.invoices[0].invoiceNumber;
const user = 'test-user-1';
const mawbNumber = detailMovement.mawbNumber;

describe('OrderAggregate', () => {
  // The following is basically an in memory event store because most commands need previous events to be properly tested
  const storedEvents: StorableEvent[] = [];
  const eventStore = mock<EventStore>();

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
  const datagenClient = mock<DatagenClient>();
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
    jest.resetAllMocks();
    jest
      .spyOn(eventStore, 'getEvents')
      .mockImplementation(async (aggregate, aggregateId) => {
        expect(aggregate).toBe('order');
        return storedEvents.filter((e) => e.aggregateId === aggregateId);
      });
    jest.spyOn(eventStore, 'storeEvent').mockImplementation(async (event) => {
      storedEvents.push(event);
    });
  });

  // Tests

  it('can create order', async () => {
    const createOrderCommandHandler = new CreateOrderHandler(
      storeEventPublisher,
      aggregateRepository,
    );
    const createOrderCommand = new CreateOrderCommand(aggregateKey, orderId, {
      ...mockSubmitOrder,
    });
    await createOrderCommandHandler.execute(createOrderCommand);

    expect(eventStore.getEvents).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalled();

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.order).toBeDefined();
    expect(aggregate?.order.billTo).toBe(mockSubmitOrder.billTo);
  });

  it('can process order notification', async () => {
    // The test for this command assumes an order was created and locked in previous tests
    const processNotificationHandler = new ProcessNotificationHandler(
      aggregateRepository,
    );
    const processNotificationCommand = new ProcessNotificationProcessedCommand(
      aggregateKey,
      orderId,
      LookupType.Order,
      '',
    );
    await processNotificationHandler.execute(processNotificationCommand);

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(1);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.orderProcessed).toBe(true);
  });

  it('can process pickup file', async () => {
    // The test for this command assumes an order was created and locked in previous tests
    const processPickupFileCommandHandler = new ProcessPickupFileHandler(
      aggregateRepository,
    );
    mockPickupFile.shipperReference = orderId;
    const processPickupFileCommand = new ProcessPickupFileCommand(
      aggregateKey,
      mockPickupFile,
    );
    await processPickupFileCommandHandler.execute(processPickupFileCommand);

    expect(eventStore.storeEvent).toBeCalled();

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.pickupFileAdded).toBe(true);
  });

  it('invalid order id throws error', async () => {
    const createOrderCommandHandler = new CreateOrderHandler(
      storeEventPublisher,
      aggregateRepository,
    );
    const wrongAggregateKey = new OrderAggregateKey('', ecomNumber);

    const createOrderCommand = new CreateOrderCommand(wrongAggregateKey, '', {
      ...mockSubmitOrder,
    });

    await createOrderCommandHandler.execute(createOrderCommand).catch(() => {
      return;
    });
    expect(eventStore.storeEvent).not.toBeCalled();
  });

  it('cannot create amendment when order is not locked', async () => {
    // The test for this command assumes an order was created but not locked in a previous test
    const amendment: Amendment = {
      orderNumber: orderId,
      ecomBusinessCode: ecomNumber,
      invoiceNumber: invoiceNumber,
      orderLines: [{ lineNumber: 0 }],
    };
    const createAmendmentCommandHandler = new CreateAmendmentCommandHandler(
      aggregateRepository,
    );
    const createAmendment = new CreateAmendmentCommand(
      aggregateKey,
      orderId,
      invoiceNumber,
      invoiceId,
      user,
      amendment,
    );
    await createAmendmentCommandHandler.execute(createAmendment).catch(() => {
      return;
    });

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(1);
  });

  it('can lock order', async () => {
    // The test for this command assumes an order was created in a previous test
    const lockOrderCommandHandler = new LockOrderCommandHandler(
      aggregateRepository,
    );
    const lockOrderCommand = new LockOrderCommand(
      aggregateKey,
      orderId,
      invoiceId,
      user,
    );
    await lockOrderCommandHandler.execute(lockOrderCommand);

    expect(eventStore.storeEvent).toBeCalled();

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );
    const lockedInvoice = aggregate?.order?.invoices?.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );

    expect(lockedInvoice?.locked).toBe(true);
    expect(lockedInvoice?.lockedBy).toBe(user);
  });

  it('can create amendment', async () => {
    // The test for this command assumes an order was created and locked in previous tests
    const amendment: Amendment = {
      orderNumber: orderId,
      ecomBusinessCode: ecomNumber,
      invoiceNumber: invoiceNumber,
      orderLines: [{ lineNumber: 0 }],
    };
    const createAmendmentCommandHandler = new CreateAmendmentCommandHandler(
      aggregateRepository,
    );
    const createAmendment = new CreateAmendmentCommand(
      aggregateKey,
      orderId,
      invoiceId,
      invoiceNumber,
      user,
      amendment,
    );
    await createAmendmentCommandHandler.execute(createAmendment);

    expect(eventStore.storeEvent).toBeCalled();
  });

  it('can unlock order', async () => {
    // The test for this command assumes an order was created and locked in previous tests
    const unlockOrderCommandHandler = new UnlockOrderCommandHandler(
      aggregateRepository,
    );

    const lockUser: UserResponse = {
      id: '',
      email: 'test-user-1',
      firstName: '',
      lastName: '',
      role: 'viewer',
      locked: false,
    };

    const unlockOrder = new UnlockOrderCommand(
      aggregateKey,
      orderId,
      invoiceNumber,
      lockUser,
    );
    await unlockOrderCommandHandler.execute(unlockOrder);

    expect(eventStore.storeEvent).toBeCalled();

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );
    const unlockedInvoice = aggregate?.order?.invoices?.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );
    expect(unlockedInvoice?.locked).toBe(false);
  });

  it('create error event when datagen returns error when submit order', async () => {
    // The test for this command assumes an order was created, processed and a pickup file was added but the submitOrderMethod was not invoked yet in a previous test
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockImplementation(async (_order) => {
        throw mockError;
      });
    const invokeSubmitOrderMethodHandler = new InvokeSubmitOrderMethodHandler(
      aggregateRepository,
      datagenClient,
    );
    const invokeCommand = new InvokeSubmitOrderMethodCommand(
      aggregateKey,
      orderId,
      ecomNumber,
    );
    await invokeSubmitOrderMethodHandler.execute(invokeCommand);

    expect(datagenClient.invokeSubmitOrder).toHaveBeenCalled();
    expect(eventStore.storeEvent).toBeCalledTimes(2);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.submitOrderMethodInvoked).toBe<boolean>(false);
  });

  it('can invoke hyperledger with submitOrder', async () => {
    // The test for this command assumes an order was created, processed and a pickup file was added in previous tests
    datagenClient.invokeSubmitOrder.mockClear();
    jest
      .spyOn(datagenClient, 'invokeSubmitOrder')
      .mockImplementation(async (order) => {
        return {
          message: {
            response: `OK, SubmitOrder invoked for order ${order.orderNumber}`,
            txnId: '',
          },
          error: '',
        };
      });
    const invokeSubmitOrderMethodHandler = new InvokeSubmitOrderMethodHandler(
      aggregateRepository,
      datagenClient,
    );
    const invokeCommand = new InvokeSubmitOrderMethodCommand(
      aggregateKey,
      orderId,
      ecomNumber,
    );
    await invokeSubmitOrderMethodHandler.execute(invokeCommand);

    expect(datagenClient.invokeSubmitOrder).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalledTimes(1);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.submitOrderMethodInvoked).toBe(true);
  });

  it('Can add master movement file', async () => {
    // The test for this command assumes an order was created
    const processMasterMovementFileCommandHandler =
      new ProcessMasterMovementFileHandler(aggregateRepository);
    const processMasterMovementFileCommand =
      new ProcessMasterMovementFileCommand(
        aggregateKey,
        orderId,
        mockMasterMovement,
        'test',
      );
    await processMasterMovementFileCommandHandler.execute(
      processMasterMovementFileCommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(1);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.movementData.mawb).toBe(mawbNumber);
  });

  it('Can add detail movement file', async () => {
    // The test for this command assumes an order was created
    const processMasterMovementFileCommandHandler =
      new ProcessMasterMovementFileHandler(aggregateRepository);
    const processMasterMovementFileCommand =
      new ProcessMasterMovementFileCommand(
        aggregateKey,
        orderId,
        mockMasterMovement,
        'test',
      );
    await processMasterMovementFileCommandHandler.execute(
      processMasterMovementFileCommand,
    );
    const processDetailMovementFileCommandHandler =
      new ProcessDetailMovementHandler(aggregateRepository);
    const processDetailMovementFileCommand =
      new ProcessDetailMovementFileCommand(
        aggregateKey,
        orderId,
        detailMovement,
      );
    await processDetailMovementFileCommandHandler.execute(
      processDetailMovementFileCommand,
    );

    expect(eventStore.storeEvent).toHaveBeenCalledTimes(2);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.movementData).toBeDefined();
    expect(aggregate?.movementData.mawb).toBe(mawbNumber);
  });

  it('create error event when datagen returns error when updating transport info', async () => {
    // The test for this command assumes an order was created and movement files are added in previous tests
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockImplementation(async (_order) => {
        throw mockError;
      });
    const invokeUpdateTransportInfoMethodHandler =
      new InvokeUpdateTransportInfoMethodHandler(
        aggregateRepository,
        datagenClient,
      );
    const invokeCommand = new InvokeUpdateTransportInfoMethodCommand(
      aggregateKey,
    );
    await invokeUpdateTransportInfoMethodHandler.execute(invokeCommand);

    expect(datagenClient.invokeUpdateTransportInfo).toHaveBeenCalled();
    expect(eventStore.storeEvent).toBeCalledTimes(2);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.updateTransportInfoMethodInvoked).toBe<boolean>(false);
  });

  it('can invoke hyperledger with updateTransportInfo', async () => {
    // The test for this command assumes an order was created and movement files are added in previous tests
    datagenClient.invokeUpdateTransportInfo.mockClear();
    jest
      .spyOn(datagenClient, 'invokeUpdateTransportInfo')
      .mockImplementation(async (order) => {
        return {
          message: {
            response: `OK, UpdateTransportInfo invoked for order: ${order.id}`,
            txnId: '',
          },
          error: '',
        };
      });
    const invokeUpdateTransportInfoMethodHandler =
      new InvokeUpdateTransportInfoMethodHandler(
        aggregateRepository,
        datagenClient,
      );
    const invokeCommand = new InvokeUpdateTransportInfoMethodCommand(
      aggregateKey,
    );
    await invokeUpdateTransportInfoMethodHandler.execute(invokeCommand);

    expect(datagenClient.invokeUpdateTransportInfo).toBeCalled();
    expect(eventStore.storeEvent).toBeCalled();

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.updateTransportInfoMethodInvoked).toBe(true);
  });

  it('create error event when datagen returns error when invoking initiate declaration', async () => {
    // The test for this command assumes an order was created and movement files are added in previous tests
    const mockError = new ApplicationError();
    mockError.addStatusRelatedErrors(400, 'HL');
    jest
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockImplementation(async (_order) => {
        throw mockError;
      });
    const invokeInitiateDeclarationMethodHandler =
      new InvokeInitiateDeclarationCallMethodCommandHandler(
        aggregateRepository,
        datagenClient,
      );
    const invokeCommand = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      orderId,
      invoiceId,
    );
    await invokeInitiateDeclarationMethodHandler.execute(invokeCommand);

    await expect(datagenClient.invokeInitiateDeclaration).toHaveBeenCalled();
    expect(eventStore.storeEvent).toHaveBeenCalledTimes(2); // 2 types of errors should be stored

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.initiateDeclarationcallMethodInvoked).toBe<boolean>(
      false,
    );
  });

  it('can invoke hyperledger with InitiateDeclaration', async () => {
    // The test for this command assumes an order was created and movement files are added in previous tests
    datagenClient.invokeInitiateDeclaration.mockClear();
    jest
      .spyOn(datagenClient, 'invokeInitiateDeclaration')
      .mockImplementation(async (order) => {
        return {
          message: {
            response: `OK, InitiateDeclaration invoked for order ${order.id}`,
            txnId: '',
          },
          error: '',
        };
      });
    const invokeInitiateDeclarationMethodHandler =
      new InvokeInitiateDeclarationCallMethodCommandHandler(
        aggregateRepository,
        datagenClient,
      );
    const invokeCommand = new InvokeInitiateDeclarationCallMethodCommand(
      aggregateKey,
      orderId,
      invoiceId,
    );
    await invokeInitiateDeclarationMethodHandler.execute(invokeCommand);

    expect(datagenClient.invokeInitiateDeclaration).toHaveBeenCalled();
    expect(eventStore.storeEvent).toBeCalled();
    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      aggregateKey.key(),
    );

    expect(aggregate?.initiateDeclarationcallMethodInvoked).toBe<boolean>(true);
  });

  it('can cancel order', async () => {
    const orderToCancel = {
      ...mockSubmitOrder,
      orderNumber: cancelOrder.orderNumber,
    };
    const cancelAggregate = new OrderAggregateKey(
      cancelOrder.orderNumber,
      cancelOrder.ecomBusinessCode,
    );

    const createOrderCommandHandler = new CreateOrderHandler(
      storeEventPublisher,
      aggregateRepository,
    );
    const cancelOrderCommandHandler = new CancelOrderHandler(
      aggregateRepository,
    );
    const createOrderCommand = new CreateOrderCommand(
      cancelAggregate,
      orderToCancel.orderNumber,
      orderToCancel,
    );
    const cancelOrderCommand = new CancelOrderCommand(
      cancelAggregate,
      cancelOrder,
    );
    await createOrderCommandHandler.execute(createOrderCommand);
    await cancelOrderCommandHandler.execute(cancelOrderCommand);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      cancelAggregate.key(),
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.status).toBe(OrderStatus.OrderCancelled);
  });

  it('cannot invoke initiate declaration method on cancelled order', async () => {
    // This test asumes a already cancelled order
    const orderToCancel = {
      ...mockSubmitOrder,
      orderNumber: cancelOrder.orderNumber,
    };
    const cancelAggregate = new OrderAggregateKey(
      cancelOrder.orderNumber,
      cancelOrder.ecomBusinessCode,
    );

    const invokeInitiateDeclarationMethodHandler =
      new InvokeInitiateDeclarationCallMethodCommandHandler(
        aggregateRepository,
        datagenClient,
      );
    const invokeCommand = new InvokeInitiateDeclarationCallMethodCommand(
      cancelAggregate,
      orderToCancel.orderNumber,
      orderToCancel.invoices[0].invoiceNumber,
    );
    await invokeInitiateDeclarationMethodHandler.execute(invokeCommand);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      cancelAggregate.key(),
    );

    expect(aggregate).toBeDefined();
    expect(!aggregate?.initiateDeclarationcallMethodInvoked);
    expect(eventStore.storeEvent).toBeCalledTimes(1);
  });

  it('cannot cancel order with wrong order id', async () => {
    // Remove all stored events
    storedEvents.length = 0;

    const createOrderCommandHandler = new CreateOrderHandler(
      storeEventPublisher,
      aggregateRepository,
    );
    const cancelOrderCommandHandler = new CancelOrderHandler(
      aggregateRepository,
    );
    const createOrderCommand = new CreateOrderCommand(
      aggregateKey,
      mockSubmitOrder.orderNumber,
      { ...mockSubmitOrder },
    );
    const cancelOrderCommand = new CancelOrderCommand(
      aggregateKey,
      cancelOrder,
    );
    await createOrderCommandHandler.execute(createOrderCommand);
    await cancelOrderCommandHandler.execute(cancelOrderCommand);

    const aggregate = await aggregateRepository.getById(
      OrderAggregate,
      'order',
      mockSubmitOrder.orderNumber,
    );

    expect(aggregate).toBeDefined();
    expect(aggregate?.status).not.toBe(OrderStatus.OrderCancelled);
  });

  it('bug 537 - claim no is taken from document tracking request id', () => {
    const aggregate = new OrderAggregate('test');
    const mockDeclaration: Declaration = {
      declarationType: '',
      declarationNumber: '',
      brokerCode: '',
      exporterCode: '',
      batchId: '',
      clearanceStatus: '',
      version: '',
      shipmentMode: '',
      bodId: '',
      chargeAmount: '',
      chargeType: '',
      regimeType: '',
      senderIdentification: '',
      numberOfPages: 0,
      direction: null,
      returnRequestNo: null,
      createdAt: null,
      errorType: '',
      errors: '',
      hlKey: '',
    };
    aggregate.order = mockSubmitOrder;
    aggregate.order.invoices[0].declarations = [mockDeclaration];
    const expectedId = 'expectedId';
    const request: DocumentTrackingData = {
      BODID: '',
      Key: '',
      actionBy: '',
      authorizedDeclarant: '',
      createdAt: 0,
      currentStage: '',
      customsStatus: CustomsStatus.Cleared,
      customsSubmissionResponse: '',
      declarationType: '',
      declarationNumber: '',
      documentName: '',
      documentNo: '',
      documentType: DocumentType.Claim,
      documents: [],
      ecomBusinessCode: '',
      errorType: '',
      errors: '',
      funcKey: '',
      history: [],
      invoiceNo: mockSubmitOrder.invoices[0].invoiceNumber,
      isExited: false,
      kvp: '',
      lastActivityTimeStamp: 0,
      lastStage: '',
      orderNo: '',
      orgType: '',
      platformRequestNumber: '',
      regimeType: '',
      requestID: expectedId,
      responseJSONPayload: '',
      retryCount: 0,
      shippingParameterID: '',
      signature: '',
      transportDocumentNo: '',
      direction: '',
      returnRequestNo: '',
    };
    aggregate.processClaimDocumentTrackingDataProcessedEvent(request);
    expect(
      aggregate.order.invoices[0].declarations[0].claim?.nrClaimNumber,
    ).toBe(expectedId);
  });
});
