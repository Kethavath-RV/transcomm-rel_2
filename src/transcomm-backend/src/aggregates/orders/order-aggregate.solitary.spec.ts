import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AggregateAmendmentData,
  CancelOrder,
  CheckPointFile,
  ClaimRequestData,
  ConfirmReturnDelivery,
  CustomsStatus,
  Declaration,
  DeclarationJsonMappingData,
  DeclarationResponse,
  DetailMovement,
  DHLEDeclarationRequest,
  DocumentTrackingData,
  ErrorBusiness,
  HyperledgerResponse,
  InvoiceData,
  LookupType,
  MasterMovement,
  ModeType,
  Movement,
  OrderData,
  OrderStatus,
  ReturnOrder,
  ReturnRequest,
  ShippingDetailsInvoice,
} from 'core';
import {
  EventSourcingModule,
  EventStore,
  StorableEvent,
  StoreEventPublisher,
  ViewEventBus,
} from 'event-sourcing';
import mock, { mockDeep } from 'jest-mock-extended/lib/Mock';
import { detailMovement, mockMasterMovement } from 'models/mocks.models';
import { OrderAggregate } from './order-aggregate';
import { OrderAggregateKey } from './order-aggregate-key';
import { mockPickupFile, mockSubmitOrder } from './views/__mocks__/order.mock';
const orderKey = new OrderAggregateKey('test', 'test');

const cancelOrderRequest: CancelOrder = {
  orderNumber: orderKey.orderId,
  actionDate: '',
  ecomBusinessCode: orderKey.ecomCode,
  mode: ModeType.Cancel,
  invoices: [
    {
      cancellationReason: "turned out I could believe it wasn't butter",
      invoiceNumber: mockSubmitOrder.invoices[0].invoiceNumber,
    },
  ],
};

const returnOrderRequest: ReturnOrder = {
  orderNumber: orderKey.orderId,
  actionDate: new Date().toISOString(),
  ecomBusinessCode: orderKey.ecomCode,
  mode: ModeType.Return,
  invoices: [
    {
      invoiceNumber: '1',
      exporterCode: '1234',
      returnDetail: {
        returnRequestNo: '500',
      },
      lineItems: [
        {
          lineNo: 1,
          mode: ModeType.Return,
          quantityReturned: 4,
        },
      ],
      mode: ModeType.Return,
    },
  ],
};

/*
 order-aggregate.ts                                              |   48.44 |    25.84 |   39.82 |   49.65 | ...,539-562,572-584,621-745,793-900,914-917,978-1021,1035,1038-1042,1055,1103,1150-1151,1154,1157,1161-1169,1187-1347,1360-1370,1452-1465,1580-1602,1634-1656,1689-1712,1798-1823,1852-1909
*/

describe('OrderAggregateSolitary', () => {
  let createOrderRequestTwo = JSON.parse(JSON.stringify(mockSubmitOrder));
  let orderAggregate: OrderAggregate;
  let storedEvents: StorableEvent[] = [];

  beforeEach(async () => {
    const mockEventStore = mock<EventStore>();

    jest
      .spyOn(mockEventStore, 'getEvents')
      .mockImplementation(async (aggregate, aggregateId) => {
        expect(aggregate).toBe('order');
        return storedEvents.filter((e) => e.aggregateId === aggregateId);
      });
    jest
      .spyOn(mockEventStore, 'storeEvent')
      .mockImplementation(async (event) => {
        storedEvents.push(event);
      });

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, EventSourcingModule.forFeature()],
    })
      .overrideProvider(EventStore)
      .useValue(mockEventStore)
      .overrideProvider(ViewEventBus)
      .useValue(mock<ViewEventBus>())
      .compile();

    //seed mock order
    const publisher = module.get<StoreEventPublisher>(StoreEventPublisher);
    const merged = publisher.mergeClassContext(OrderAggregate);
    orderAggregate = new merged(orderKey.key());
    orderAggregate.submitOrder(createOrderRequestTwo);
    orderAggregate.commit();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    storedEvents = [];
    createOrderRequestTwo = JSON.parse(JSON.stringify(mockSubmitOrder));
  });

  it('aggregate is defined', () => {
    expect(orderAggregate).toBeDefined();
  });

  it('aggregate has correct order aggregate', async () => {
    expect(orderAggregate).not.toBeNull();
    expect(orderAggregate.order.orderNumber).toBe(mockSubmitOrder.orderNumber);
  });

  it('process order created applies correctly', async () => {
    orderAggregate.processNotificationProcessed(
      orderKey.orderId,
      LookupType.Order,
      'random',
    );
    expect(orderAggregate?.orderProcessed).toBe(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Processed notification received ${LookupType.Order}`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('process hyperledger submit order applies correctly when successful', async () => {
    const hyperLedgerResponse: HyperledgerResponse = {
      message: {
        response: 'its on the chain',
        txnId: '123412',
      },
      error: '',
    };
    orderAggregate.processHyperledgerSubmitOrderResponse(hyperLedgerResponse);
    expect(orderAggregate.submitOrderMethodInvoked).toBe(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Submit order invoked (HL)',
          exceptions: [],
        }),
      ]),
    );
  });

  it('process hyperledger submit order applies correctly when unsuccessful', async () => {
    const hyperLedgerResponse: HyperledgerResponse = {
      message: {
        response: '',
        txnId: '',
      },
      error: 'its off the chain',
    };
    orderAggregate.processHyperledgerSubmitOrderResponse(hyperLedgerResponse);
    expect(orderAggregate.submitOrderMethodInvoked).toBe(false);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Submit order invoked (HL)',
          exceptions: [],
        }),
      ]),
    );
  });

  it('cancelling order applies correctly', async () => {
    orderAggregate.cancelOrder(cancelOrderRequest);
    expect(orderAggregate?.order.mode).toBe(ModeType.Cancel);
    expect(orderAggregate?.order.invoices[0].mode).toBe(ModeType.Cancel);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Order cancelled',
          exceptions: [],
        }),
      ]),
    );
  });

  it('update order applies correctly', async () => {
    const updateRequest = { ...createOrderRequestTwo };
    updateRequest.shipTo = 'change';
    updateRequest.consigneeName = 'consignee';
    orderAggregate.updateOrder(updateRequest);
    expect(orderAggregate.order).toStrictEqual(updateRequest);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Order Updated',
          exceptions: [],
        }),
      ]),
    );
  });

  it('process hyperledger submit order mode final applies correctly', async () => {
    const hyperLedgerResponse: HyperledgerResponse = {
      message: {
        response: 'its on the chain',
        txnId: '123412',
      },
      error: '',
    };
    orderAggregate.processHyperledgerSubmitOrderModeFinalResponse(
      hyperLedgerResponse,
    );
    expect(orderAggregate.submitOrderModeFinalMethodInvoked).toBe(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Submit order invoked(final) (HL)',
          exceptions: [],
        }),
      ]),
    );
  });

  it('process pickup file applies correctly (outbound)', async () => {
    const pickupFile: CheckPointFile = {
      ...mockPickupFile,
    };
    orderAggregate.processPickupFile(pickupFile);
    expect(orderAggregate.status).toBe(OrderStatus.InTransit);
    expect(orderAggregate.pickupFile).toStrictEqual(mockPickupFile);
    expect(orderAggregate.pickupFileAdded).toBe(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Shipment pickup',
          exceptions: [],
        }),
      ]),
    );
  });

  it('process master movement applies correctly (outbound)', async () => {
    const masterMovement: MasterMovement = {
      ...mockMasterMovement,
    };

    orderAggregate.processMasterMovementFile(
      masterMovement,
      mockPickupFile.hawb,
    );

    expect(orderAggregate.movementData.mawb).toBe(masterMovement.mawbNumber);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Master movement received',
          exceptions: [],
        }),
      ]),
    );
  });

  it('process detail movement applies correctly (outbound)', async () => {
    const detailMovementRequest: DetailMovement = {
      ...detailMovement,
    };

    orderAggregate.processDetailMovement(detailMovementRequest);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Detail movement received',
          exceptions: [],
        }),
      ]),
    );
  });

  it('process declaration request applies correctly (outbound)', async () => {
    const declarationRequest = mockDeep<DHLEDeclarationRequest>();
    orderAggregate.processDeclarationRequest(declarationRequest);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'Declaration request received (DHLE)',
          exceptions: [],
        }),
      ]),
    );
  });

  it('lockOrder applies correctly', async () => {
    const invoiceNumber = createOrderRequestTwo.invoices[0].invoiceNumber;
    const username = 'me';
    orderAggregate.lockOrder(invoiceNumber, username);
    const result = orderAggregate.order.invoices.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );

    expect(result).toBeDefined();
    expect(result?.locked).toBe(true);
    expect(result?.lockedBy).toBe(username);
  });

  it('unlockOrder applies correctly', async () => {
    const invoiceNumber = createOrderRequestTwo.invoices[0].invoiceNumber;
    const username = 'me';
    orderAggregate.lockOrder(invoiceNumber, username);
    const lockResult = orderAggregate.order.invoices.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );

    expect(lockResult).toBeDefined();
    expect(lockResult?.locked).toBe(true);
    expect(lockResult?.lockedBy).toBe(username);

    orderAggregate.unlockOrder(invoiceNumber, username);

    const unlockResult = orderAggregate.order.invoices.find(
      (x) => x.invoiceNumber === invoiceNumber,
    );

    expect(unlockResult).toBeDefined();
    expect(unlockResult?.locked).toBe(false);
    expect(unlockResult?.lockedBy).toBeUndefined();
  });

  it('addErrorEvent applies correctly (not exception)', async () => {
    const commandName = 'test';
    const errorType = 'testType';
    const errorMessage = 'testMessage';
    const errorTime = new Date();
    orderAggregate.addErrorEvent(
      commandName,
      errorType,
      errorMessage,
      errorTime,
    );
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `ErrorReceivedEvent - error: ${errorType}`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('ProcessDeclarationDocumentTrackingDataProcessedEvent applies correctly (no matching invoice)', async () => {
    const documentTracking = mock<DocumentTrackingData>();
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    expect(orderAggregate?.eventChain).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Document tracking processed (declaration)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('ProcessDeclarationDocumentTrackingDataProcessedEvent applies correctly (matching invoice, no errors)', async () => {
    const documentTracking = mockDeep<DocumentTrackingData>();
    documentTracking.responseJSONPayload = '';
    documentTracking.invoiceNo = orderAggregate.order.invoices[0].invoiceNumber;
    documentTracking.createdAt = 1627474971756;
    documentTracking.errors = '';
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Document tracking processed (declaration)`,
          exceptions: [],
        }),
      ]),
    );
    expect(orderAggregate.order.invoices[0].declarations).toBeDefined();
    expect(orderAggregate.order.invoices[0].declarations?.length).toEqual(1);
  });

  it('ProcessDeclarationDocumentTrackingDataProcessedEvent applies correctly (matching invoice, with errors)', async () => {
    const documentTracking = mockDeep<DocumentTrackingData>();
    documentTracking.responseJSONPayload = '';
    documentTracking.invoiceNo =
      orderAggregate.order.invoices[0].invoiceNumber ?? '2';
    documentTracking.createdAt = 1627474971756;
    documentTracking.errors =
      '"[{\\"errorCode\\":\\"502\\",\\"errorDescription\\":\\"Statistical Quantity Unit is invalid for the specified HS Code.\\",\\"errorType\\":\\"business\\",\\"level\\":\\"E\\"}]"';
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    expect(orderAggregate.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Exception`,
          exceptions: expect.arrayContaining([
            expect.objectContaining({
              exceptionCode: '502',
              exceptionDetail: expect.any(String),
            }),
          ]),
        }),
      ]),
    );

    expect(orderAggregate.order.invoices[0].declarations).toBeDefined();
    expect(orderAggregate.order.invoices[0].declarations?.length).toEqual(1);
  });

  it('ProcessDeclarationDocumentTrackingDataProcessedEvent applies correctly (twice) (matching invoice, no errors)', async () => {
    const changedText = 'changed';
    const documentTracking = mockDeep<DocumentTrackingData>();
    documentTracking.responseJSONPayload = '';
    documentTracking.invoiceNo = orderAggregate.order.invoices[0].invoiceNumber;
    documentTracking.createdAt = 1627474971756;
    documentTracking.errors = '';
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    documentTracking.documentNo = changedText;

    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    const declaration = orderAggregate.order.invoices
      .find((x) => x.invoiceNumber === documentTracking.invoiceNo)
      ?.declarations?.find((x) => x);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Document tracking processed (declaration)`,
          exceptions: [],
        }),
      ]),
    );
    expect(declaration).toBeDefined();
    expect(orderAggregate.order.invoices[0].declarations?.length).toEqual(1);
    expect(declaration?.declarationNumber).toEqual(changedText);
  });

  it('ProcessDeclarationDocumentTrackingDataProcessedEvent applies correctly (twice) (matching invoice, no errors, different documents)', async () => {
    const documentTracking = mockDeep<DocumentTrackingData>();
    documentTracking.responseJSONPayload = '';
    documentTracking.invoiceNo = orderAggregate.order.invoices[0].invoiceNumber;
    documentTracking.createdAt = 1627474971756;
    documentTracking.errors = '';
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    const secondDocumentTracking = mockDeep<DocumentTrackingData>();
    secondDocumentTracking.responseJSONPayload = '';
    secondDocumentTracking.invoiceNo =
      orderAggregate.order.invoices[0].invoiceNumber;
    secondDocumentTracking.createdAt = 1627474971756;
    secondDocumentTracking.errors = '';

    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      secondDocumentTracking,
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Document tracking processed (declaration)`,
          exceptions: [],
        }),
      ]),
    );
    expect(orderAggregate.order.invoices[0].declarations?.length).toEqual(2);
  });

  it('ProcessDeclarationDocumentTrackingDataProcessedEvent applies correctly (with filled responseJSONPayload)', async () => {
    const documentTracking = mockDeep<DocumentTrackingData>();
    documentTracking.responseJSONPayload =
      '{"DataArea":{"Verb":"CONFIRM","BOD":{"ResponseDetails":{"BODFailureMessage":null,"BODWarningMessage":null,"BODSuccessMessage":{"ResponseDetails":{"MessageType":null,"MessageCode":null,"MessageDescription":null,"RequestNumber":1041403}},"DeclarationCharges":[{"ChargeType":101,"ChargeAmount":45}],"Identifier":null}}},"BODHeader":{"ReleaseID":"9.3","VersionID":"1.0","SystemEnvironmentCode":"SIT","LanguageCode":"en-US"},"ApplicationArea":{"Sender":{"ReferenceID":"00000000000011942532","LogicalID":"DPP","ComponentID":null,"TaskID":"ECOM-SUBMIT-DEC-RESP","ConfirmationCode":"Always","AuthorizationID":null},"Receiver":null,"CreationDateTime":1641391435643,"Signature":null,"BODID":"be46ac8f-e5e1-4ed1-9b97-8bea376c0add"}}';
    documentTracking.invoiceNo = orderAggregate.order.invoices[0].invoiceNumber;
    documentTracking.createdAt = 1627474971756;
    documentTracking.errors = '';
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    const declaration = orderAggregate.order.invoices
      .find((x) => x.invoiceNumber === documentTracking.invoiceNo)
      ?.declarations?.find((x) => x);

    expect(declaration).toBeDefined();
    expect(orderAggregate.order.invoices[0].declarations?.length).toEqual(1);
    expect(declaration?.chargeAmount).toEqual('45');
    expect(declaration?.chargeType).toEqual('101');
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Document tracking processed (declaration)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDeclarationResponseSentEvent applies correctly', async () => {
    const declarationResponse = mockDeep<DeclarationResponse>();

    orderAggregate.processDeclarationResponseSentEvent(
      declarationResponse,
      'mock time',
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: 'DHLE Declaration Response sent',
          exceptions: [],
        }),
      ]),
    );
  });

  it('confirmReturnDeliveryMessageReceived applies correctly', async () => {
    const confirmReturn = mock<ConfirmReturnDelivery>();
    orderAggregate.confirmReturnDeliveryMessageReceived(
      orderKey.orderId,
      'test',
      confirmReturn,
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Confirm return delivery message received`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processOtherCheckpointFile applies correctly', async () => {
    const mockCheckpointFile = mock<CheckPointFile>();
    orderAggregate.processOtherCheckpointFile(mockCheckpointFile);

    expect(orderAggregate.delivered.length).toBeGreaterThan(0);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `${mockCheckpointFile.eventCode} checkpoint file received`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDfCheckpointFile applies correctly', async () => {
    const mockCheckpointFile = mock<CheckPointFile>();
    orderAggregate.processDfCheckpointFile(mockCheckpointFile);

    expect(orderAggregate.delivered.length).toBeGreaterThan(0);
    expect(orderAggregate.dfCheckpointFileReceivedEvent).toBe(true);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `DF checkpoint file received`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processUndelivered applies correctly', async () => {
    const mockCheckpointFile = mock<CheckPointFile>();
    orderAggregate.movementData = mock<Movement>();
    orderAggregate.processUndelivered(mockCheckpointFile);

    expect(orderAggregate.delivered.length).toBeGreaterThan(0);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Delivery attempted ${mockCheckpointFile.eventCode}`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDelivered applies correctly', async () => {
    const mockCheckpointFile = mock<CheckPointFile>();
    orderAggregate.processDelivered(mockCheckpointFile);

    expect(orderAggregate.delivered.length).toBeGreaterThan(0);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Delivery`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDelivered applies twice correctly - updates eventDate', async () => {
    const hawb = '123456';
    const mockCheckpointFile = mock<CheckPointFile>();
    mockCheckpointFile.eventCode = 'OK';
    mockCheckpointFile.hawb = hawb;
    const mockCheckpointFileTwo = mock<CheckPointFile>();
    mockCheckpointFileTwo.eventCode = 'OK';
    mockCheckpointFileTwo.eventDate = '2021-09-29 17:05:33'; //example data from postman
    mockCheckpointFileTwo.eventGMT = '+40:00'; //example data from postman
    mockCheckpointFileTwo.hawb = hawb;

    orderAggregate.processDelivered(mockCheckpointFile);
    orderAggregate.processDelivered(mockCheckpointFileTwo);

    const deliveredFile = orderAggregate.delivered.find(
      (x) => x.airwayBillNumber === hawb && x.deliveryCode === 'OK',
    );

    expect(orderAggregate.delivered.length).toBeGreaterThan(0);
    expect(deliveredFile).toBeDefined();
    expect(deliveredFile?.deliveryDate).toEqual(
      new Date(
        mockCheckpointFileTwo.eventDate + mockCheckpointFileTwo.eventGMT,
      ),
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Delivery`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('submitReturnOrder applies correctly', async () => {
    orderAggregate.submitReturnOrder(returnOrderRequest, '12345');
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Order returned`,
          exceptions: [],
        }),
      ]),
    );
    expect(orderAggregate.returns.length).toBeGreaterThan(0);
  });

  it('processDeliverOrderResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    orderAggregate.processDeliverOrderResponse(request);
    orderAggregate.deliverOrderMethodInvoked = true;
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Process deliver order method invoked`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processReturnDeliverOrderResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    const mockReturnRequest = mock<ReturnRequest>();
    mockReturnRequest.delivered = false;
    orderAggregate.returns = [mockReturnRequest];
    orderAggregate.processReturnDeliverOrderResponse(
      request,
      mockReturnRequest.vcId,
    );

    const returnedOrder = orderAggregate.returns.find(
      (x) => x.vcId === mockReturnRequest.vcId,
    );
    expect(returnedOrder?.delivered).toEqual(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Deliver order invoked for return (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processConfirmReturnDeliveryResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    orderAggregate.processConfirmReturnDeliveryResponse(request);

    expect(orderAggregate.confirmReturnDeliveryMethodInvoked).toEqual(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Confirm receipt of the returned good/s`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processUpdateExitConfirmationResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    orderAggregate.processUpdateExitConfirmationResponse(request);

    expect(orderAggregate.updateExitConfirmationMethodInvoked).toEqual(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Update exit confirmation invoked (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processHyperledgerSubmitReturnOrderResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    const mockReturnRequest = mock<ReturnRequest>();
    orderAggregate.returns = [mockReturnRequest];
    orderAggregate.processHyperledgerSubmitReturnOrderResponse(
      request,
      mockReturnRequest.vcId,
    );

    const returnedOrder = orderAggregate.returns.find(
      (x) => x.vcId === mockReturnRequest.vcId,
    );

    expect(returnedOrder?.submitted).toEqual(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Submit return order invoked (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processHyperledgerSubmitCancelOrderResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    orderAggregate.processHyperledgerSubmitCancelOrderResponse(
      request,
      '12345',
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Cancel order invoked (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processHyperledgerInitiateDeclarationCallForAmendmentResponse applies correctly', async () => {
    const invoiceNr = '12345';
    const amendment = mock<AggregateAmendmentData>();
    amendment.invoiceNumber = invoiceNr;
    amendment.initiateDeclarationcallMethodInvokedForAmendment = false;
    const request = mock<HyperledgerResponse>();

    orderAggregate.amendmends = [amendment];
    request.error = '';
    orderAggregate.processHyperledgerInitiateDeclarationCallForAmendmentResponse(
      request,
      invoiceNr,
    );

    const result = orderAggregate.amendmends.find(
      (x) => x.invoiceNumber === invoiceNr,
    );

    expect(result?.initiateDeclarationcallMethodInvokedForAmendment).toEqual(
      true,
    );
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Initiate declaration invoked for amendment (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processHyperledgerSubmitUpdateOrderResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    orderAggregate.processHyperledgerSubmitUpdateOrderResponse(request, '');

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Update order invoked (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processHyperledgerReturnUpdateTransportInfoResponse applies correctly', async () => {
    const request = mock<HyperledgerResponse>();
    const mockReturnRequest = mock<ReturnRequest>();
    orderAggregate.returns = [mockReturnRequest];
    orderAggregate.processHyperledgerReturnUpdateTransportInfoResponse(
      request,
      mockReturnRequest.vcId,
    );

    const returnedOrder = orderAggregate.returns.find(
      (x) => x.vcId === mockReturnRequest.vcId,
    );

    expect(returnedOrder?.updatedShipping).toEqual(true);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Update transport invoked for return (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processOrderDataProcessedEvent applies correctly (no error)', async () => {
    const orderData = mock<OrderData>();
    orderAggregate.updateTransportInfoMethodInvoked = true; //test it isn't reset
    orderData.current.errorBusiness = [];
    orderAggregate.processOrderDataProcessedEvent(orderData, '', '');

    expect(orderAggregate.updateTransportInfoMethodInvoked).toEqual(true);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Order data processed (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processOrderDataProcessedEvent applies correctly (with errors)', async () => {
    const orderData = mock<OrderData>();
    orderAggregate.updateTransportInfoMethodInvoked = true; //test it is reset
    orderData.current.errorBusiness = [mock<ErrorBusiness>()];
    orderAggregate.processOrderDataProcessedEvent(orderData, '', '');

    expect(orderAggregate.updateTransportInfoMethodInvoked).toEqual(false);
    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Order data processed (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processInvoiceDataProcessedEvent applies correctly', async () => {
    const invoiceData = mock<InvoiceData>();
    orderAggregate.processInvoiceDataProcessedEvent(
      orderAggregate.order.invoices[0].invoiceNumber,
      invoiceData,
    );

    expect(orderAggregate.order.invoices[0].totalValue).toBe(
      invoiceData.current.totalValue,
    );

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Invoice data processed (HL)`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('ProcessClaimRequestDataProcessedEvent applies correctly (declaration not found)', async () => {
    const claimRequestData = mockDeep<ClaimRequestData>();
    claimRequestData.DataArea.ClaimCreationRequest.DeclarationNumber =
      'unknown';
    orderAggregate.processClaimRequestDataProcessedEvent(claimRequestData);

    expect(orderAggregate?.eventChain).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Claim request processed`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('ProcessClaimRequestDataProcessedEvent applies correctly (declaration found)', async () => {
    const claimRequestData = mockDeep<ClaimRequestData>();
    const mockDeclaration = mock<Declaration>();
    orderAggregate.order.invoices[0].declarations = [mockDeclaration];
    claimRequestData.DataArea.ClaimCreationRequest.DeclarationNumber =
      mockDeclaration.declarationNumber;
    orderAggregate.processClaimRequestDataProcessedEvent(claimRequestData);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Claim request processed`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDeclarationJsonMappingDataProcessedEvent applies correctly (invoice found, no declaration)', async () => {
    const detailedEvent = mockDeep<DeclarationJsonMappingData>();
    const shippingDetails = mock<ShippingDetailsInvoice>();
    shippingDetails.InvoiceNumber =
      orderAggregate.order.invoices[0].invoiceNumber;
    detailedEvent.DataArea.BOD.DeclarationRequest.ShippingDetails.Invoices = [
      shippingDetails,
    ];
    orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
      detailedEvent,
    );
    expect(orderAggregate.order.invoices[0].declarations?.length).toBe(1);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Declaration JSON mapping processed`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDeclarationJsonMappingDataProcessedEvent applies correctly (invoice not found)', async () => {
    const detailedEvent = mockDeep<DeclarationJsonMappingData>();
    const shippingDetails = mock<ShippingDetailsInvoice>();
    shippingDetails.InvoiceNumber = 'unknown';
    detailedEvent.DataArea.BOD.DeclarationRequest.ShippingDetails.Invoices = [
      shippingDetails,
    ];
    orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
      detailedEvent,
    );
    expect(orderAggregate.order.invoices[0].declarations).toBeUndefined();

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Declaration JSON mapping processed`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processDeclarationJsonMappingDataProcessedEvent applies correctly (invoice found with declaration)', async () => {
    const hlKey = '12345';
    const detailedEvent = mockDeep<DeclarationJsonMappingData>({
      Key: hlKey,
    });
    const shippingDetails = mock<ShippingDetailsInvoice>();
    const declaration = mock<Declaration>({
      hlKey: hlKey,
    });
    shippingDetails.InvoiceNumber =
      orderAggregate.order.invoices[0].invoiceNumber;
    orderAggregate.order.invoices[0].declarations = [declaration];
    detailedEvent.DataArea.BOD.DeclarationRequest.ShippingDetails.Invoices = [
      shippingDetails,
    ];
    orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
      detailedEvent,
    );

    expect(orderAggregate.order.invoices[0].declarations.length).toBe(1);

    expect(orderAggregate?.eventChain).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventTime: expect.any(Date),
          eventType: `Declaration JSON mapping processed`,
          exceptions: [],
        }),
      ]),
    );
  });

  it('processHyperledgerSubmitOrderForAmendmentResponse applies correctly', async () => {
    const invoiceNr = '12345';
    const txId = 'testTx';
    const response = mock<HyperledgerResponse>();
    const amendment = mock<AggregateAmendmentData>({
      invoiceNumber: invoiceNr,
      submitOrderMethodInvokedForAmendment: false,
    });

    orderAggregate.amendmends = [amendment];
    response.error = '';
    orderAggregate.processHyperledgerSubmitOrderForAmendmentResponse(
      invoiceNr,
      txId,
      response,
    );

    expect(orderAggregate.amendmends[0].txnIdSubmitOrder).toBe(txId);
    expect(
      orderAggregate.amendmends[0].submitOrderMethodInvokedForAmendment,
    ).toBe(true);
  });

  it('processHyperledgerUpdateTransportInfoResponseForAmendment applies correctly', async () => {
    const invoiceNr = '12345';
    const txId = 'testTx';
    const response = mock<HyperledgerResponse>({
      error: '',
    });
    const amendment = mock<AggregateAmendmentData>({
      invoiceNumber: invoiceNr,
      updateTransportInfoMethodInvokedForAmendment: false,
    });
    orderAggregate.amendmends = [amendment];

    orderAggregate.processHyperledgerUpdateTransportInfoResponseForAmendment(
      invoiceNr,
      txId,
      response,
    );

    expect(orderAggregate.amendmends[0].txnIdUpdateTransportInfo).toBe(txId);
    expect(
      orderAggregate.amendmends[0].updateTransportInfoMethodInvokedForAmendment,
    ).toBe(true);
  });

  describe('isDeclarationResponseComplete', () => {
    it('returns false if the declarationResponse object is not completed', async () => {
      const hlKey = '12345';
      const detailedEvent = mockDeep<DeclarationJsonMappingData>({
        Key: hlKey,
      });
      const shippingDetails = mock<ShippingDetailsInvoice>();
      const declaration = mock<Declaration>({
        hlKey: hlKey,
      });
      shippingDetails.InvoiceNumber =
        orderAggregate.order.invoices[0].invoiceNumber;
      orderAggregate.order.invoices[0].declarations = [declaration];
      detailedEvent.DataArea.BOD.DeclarationRequest.ShippingDetails.Invoices = [
        shippingDetails,
      ];
      orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
        detailedEvent,
      );

      expect(orderAggregate.order.invoices[0].declarations.length).toBe(1);
      expect(orderAggregate.declarationResponsesStatuses.length).toBe(1);
      expect(orderAggregate.isDeclarationResponseComplete(hlKey)).toEqual(
        false,
      );
    });

    it('returns false if the key is not found', async () => {
      expect(orderAggregate.isDeclarationResponseComplete('12346')).toEqual(
        false,
      );
    });
  });

  it('returns true if the declaration response object is completed and the clearance status is either 6, 7, 10, 14, 15 or an empty string', async () => {
    const hlKey = '1234';
    const detailedEvent = mockDeep<DeclarationJsonMappingData>({
      Key: hlKey,
      ApplicationArea: {
        BODID: '12345',
        CreationDateTime: new Date().toISOString(),
        Sender: { AuthorizationID: '12345' },
      },
      BODHeader: { VersionID: '12345' },
      DataArea: {
        BOD: {
          DeclarationRequest: {
            PartiesDetails: { ShippingAirlineAgentBusinessCode: '12345' },
            DeclarationDetails: {
              TransportDocumentDetails: {
                OutboundMasterDocumentNo: '12345',
                OutboundTransportDocumentNo: '12345',
              },
              DeclarantReferenceNo: '12345',
              DeclarationType: 'test',
            },
          },
        },
      },
    });
    const shippingDetails = mock<ShippingDetailsInvoice>();
    const declaration = mock<Declaration>({
      hlKey: hlKey,
    });
    shippingDetails.InvoiceNumber =
      orderAggregate.order.invoices[0].invoiceNumber;
    orderAggregate.order.invoices[0].declarations = [declaration];
    detailedEvent.DataArea.BOD.DeclarationRequest.ShippingDetails.Invoices = [
      shippingDetails,
    ];
    const documentTracking = mockDeep<DocumentTrackingData>({
      Key: hlKey,
      requestID: '12345',
      customsStatus: '6' as CustomsStatus,
      documentNo: '12345',
      history: [{ description: 'description' }],
      responseJSONPayload: '',
      createdAt: Number(new Date()),
      invoiceNo: orderAggregate.order.invoices[0].invoiceNumber,
      errors: '',
    });

    orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
      detailedEvent,
    );
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    expect(orderAggregate.order.invoices[0].declarations.length).toBe(1);
    expect(orderAggregate.declarationResponsesStatuses.length).toBe(1);
    expect(orderAggregate.isDeclarationResponseComplete(hlKey)).toEqual(true);
  });

  it('returns false if the declaration response object is filled but the customs status is not 6,7,10,14,15 or empty', async () => {
    const hlKey = '1234';
    const detailedEvent = mockDeep<DeclarationJsonMappingData>({
      Key: hlKey,
      ApplicationArea: {
        BODID: '12345',
        CreationDateTime: new Date().toISOString(),
        Sender: { AuthorizationID: '12345' },
      },
      BODHeader: { VersionID: '12345' },
      DataArea: {
        BOD: {
          DeclarationRequest: {
            PartiesDetails: { ShippingAirlineAgentBusinessCode: '12345' },
            DeclarationDetails: {
              TransportDocumentDetails: {
                OutboundMasterDocumentNo: '12345',
                OutboundTransportDocumentNo: '12345',
              },
              DeclarantReferenceNo: '12345',
              DeclarationType: 'test',
            },
          },
        },
      },
    });
    const shippingDetails = mock<ShippingDetailsInvoice>();
    const declaration = mock<Declaration>({
      hlKey: hlKey,
    });
    shippingDetails.InvoiceNumber =
      orderAggregate.order.invoices[0].invoiceNumber;
    orderAggregate.order.invoices[0].declarations = [declaration];
    detailedEvent.DataArea.BOD.DeclarationRequest.ShippingDetails.Invoices = [
      shippingDetails,
    ];
    const documentTracking = mockDeep<DocumentTrackingData>({
      Key: hlKey,
      requestID: '12345',
      customsStatus: '8' as CustomsStatus,
      documentNo: '12345',
      history: [{ description: 'description' }],
      responseJSONPayload: '',
      createdAt: Number(new Date()),
      invoiceNo: orderAggregate.order.invoices[0].invoiceNumber,
      errors: '',
    });

    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );

    orderAggregate.processDeclarationJsonMappingDataProcessedEvent(
      detailedEvent,
    );

    expect(orderAggregate.order.invoices[0].declarations.length).toBe(1);
    expect(orderAggregate.declarationResponsesStatuses.length).toBe(1);
    expect(orderAggregate.isDeclarationResponseComplete(hlKey)).toEqual(false);
  });

  it('throws an error if key is not found', () => {
    expect(() => {
      orderAggregate.getDeclarationResponseFromMapping('12346');
    }).toThrow(new Error('Incorrect key given'));
  });

  it('throws an error if key is not found', () => {
    const hlKey = '12345';
    const documentTracking = mockDeep<DocumentTrackingData>({
      Key: hlKey,
      requestID: '12345',
      customsStatus: '6' as CustomsStatus,
      documentNo: '12345',
      history: [{ description: 'description' }],
      responseJSONPayload: '',
      createdAt: Number(new Date()),
      invoiceNo: orderAggregate.order.invoices[0].invoiceNumber,
      errors: '',
    });
    orderAggregate.processDeclarationDocumentTrackingDataProcessedEvent(
      documentTracking,
    );
    expect(orderAggregate.getDeclarationResponseFromMapping(hlKey)).toEqual(
      orderAggregate.declarationResponses[0],
    );
  });
});
