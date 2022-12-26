import { Logger } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import {
  AggregateAmendmentData,
  Amendment,
  CancelOrder,
  ChainEventView,
  CheckPointFile,
  ClaimRequestData,
  ClaimType,
  ConfirmReturnDelivery,
  ContractMethod,
  ContractType,
  CustomsStatus,
  Declaration,
  DeclarationJsonMappingData,
  DeclarationResponse,
  DeclarationResponseClass,
  DeclarationResponseStatus,
  declarationType,
  DeliveredView,
  DetailMovement,
  DHLECarrierDetails,
  DHLEDeclarationRequest,
  Dictionary,
  Direction,
  DocumentTrackingArguments,
  DocumentTrackingData,
  DocumentTrackingError,
  EcomBusinessCodeLookup,
  FillStatus,
  getGMTOffset,
  HouseBillView,
  HyperledgerResponse,
  Invoice,
  InvoiceData,
  JSONMappingArguments,
  LookupType,
  MasterMovement,
  ModeType,
  Movement,
  Order,
  OrderData,
  OrderStatus,
  parseGMTOffset,
  ResponseJSONPayload,
  Return,
  ReturnOrder,
  ReturnRequest,
  SubmitOrder,
  UnitOfMeasurement,
} from 'core';
import { getLastActionDate } from 'helpers/getLastActionDate';
import { ApplicationError } from '../../models/error.model';
import { getRegimeType } from './events/handlers/helpers/getRegimeType';
import { nested_object_assign } from './events/handlers/helpers/update-order-data-helper';
import { AmendmentCreatedEvent } from './events/impl/amendment-created.event';
import { ClaimDocumentTrackingDataProcessedEvent } from './events/impl/claim-documenttrackingdata-processed.event';
import { ClaimRequestDataProcessedEvent } from './events/impl/claimrequestdata-processed.event';
import { ConfirmReturnDeliveryMethodInvokedEvent } from './events/impl/confirmreturndelivery-method-invoked.event';
import { ConfirmReturnDeliveryMessageReceivedEvent } from './events/impl/confirmreturndeliverymessagereceived.event';
import { DeclarationDocumentTrackingDataProcessedEvent } from './events/impl/declaration-documenttrackingdata-processed.event';
import { DeclarationRequestReceivedEvent } from './events/impl/declaration-request-received';
import { DeclarationJsonMappingDataProcessedEvent } from './events/impl/declarationjsonmappingdata-processed.event';
import { DeliveredEvent } from './events/impl/delivered.event';
import { DeliverOrderMethodInvokedEvent } from './events/impl/deliverorder-method-invoked.event';
import { DetailMovementReceivedEvent } from './events/impl/detail-movement-received';
import { DfCheckpointFileReceivedEvent } from './events/impl/df-checkpointfile-received.event';
import { ErrorReceivedEvent } from './events/impl/error-received.event';
import { InitiateDeclarationCallMethodInvokedForAmendmentEvent } from './events/impl/initiatedeclarationcall-method-invoked-for-amendment.event';
import { InitiateDeclarationCallMethodInvokedEvent } from './events/impl/initiatedeclarationcall-method-invoked.event';
import { InvoiceDataProcessedEvent } from './events/impl/invoicedata-processed.event';
import { InvokeHyperledgerFailedEvent } from './events/impl/invokehyperledger-failed.event';
import { MasterMovementFileReceivedEvent } from './events/impl/master-movementfile-received';
import { NotificationProcessedReceivedEvent } from './events/impl/notification-processed.event';
import { OrderCancelledEvent } from './events/impl/order-cancelled.event';
import { OrderCreatedEvent } from './events/impl/order-created.event';
import { OrderLockedEvent } from './events/impl/order-locked.event';
import { OrderReturnedEvent } from './events/impl/order-returned.event';
import { OrderUnlockedEvent } from './events/impl/order-unlocked.event';
import { OrderUpdatedEvent } from './events/impl/order-updated.event';
import { OrderDataProcessedEvent } from './events/impl/orderdata-processed.event';
import { OtherCheckpointFileReceivedEvent } from './events/impl/other-checkpointfile-received.event';
import { PickupFileReceivedEvent } from './events/impl/pickupfile-received.event';
import { ReturnDeliverOrderMethodInvokedEvent } from './events/impl/return-deliverorder-method-invoked.event';
import { ReturnUpdateTransportInfoMethodInvokedEvent } from './events/impl/return-updatetransportinfo-method-invoked.event';
import { DHLEDeclarationResponseSentEvent } from './events/impl/send-dhle-declaration-response-event';
import { SubmitCancelOrderMethodInvokedEvent } from './events/impl/submitcancelorder-method-invoked.event';
import { SubmitOrderMethodInvokedForAmendmentEvent } from './events/impl/submitorder-method-invoked-for-amendment.event';
import { SubmitOrderMethodInvokedEvent } from './events/impl/submitorder-method-invoked.event';
import { SubmitOrderModeFinalMethodInvokedEvent } from './events/impl/submitordermodefinal-method-invoked.event';
import { SubmitReturnOrderMethodInvokedEvent } from './events/impl/submitreturnorder-method-invoked.event';
import { SubmitUpdateOrderMethodInvokedEvent } from './events/impl/submitupdateorder-method-invoked.event';
import { UndeliveredEvent } from './events/impl/undelivered.event';
import { UpdateExitConfirmationMethodInvokedEvent } from './events/impl/updateexitconfirmation-method-invoked.event';
import { UpdateTransportInfoMethodInvokedForAmendmentEvent } from './events/impl/updatetransportinfo-method-invoked-for-amendment.event';
import { UpdateTransportInfoMethodInvokedEvent } from './events/impl/updatetransportinfo-method-invoked.event';

export class OrderAggregate extends AggregateRoot {
  private readonly logger = new Logger(this.constructor.name);

  errorEvents: ErrorReceivedEvent[] = [];
  order: Order; //outbound order
  returns: ReturnRequest[] = []; //inbound return orders

  // Properties that correspond with OrderView properties 1-1
  id: string;
  orderDate: Date | string | undefined;
  ecomBusinessCode: string;
  status: OrderStatus;
  houseBills: HouseBillView[] = [];
  pickupFile: CheckPointFile;
  movementData: Movement;
  declarationRequest: DHLEDeclarationRequest;
  delivered: DeliveredView[] = [];
  eventChain: ChainEventView[] = [];

  // Other properties
  pickupFileAdded: boolean;
  pickupFileAddedForReturn: boolean;
  dfCheckpointFileReceivedEvent = false;
  submitOrderMethodInvoked = false;
  submitOrderModeFinalMethodInvoked = false;
  deliverOrderMethodInvoked = false;
  updateTransportInfoMethodInvoked = false;
  initiateDeclarationcallMethodInvoked = false;
  confirmReturnDeliveryMethodInvoked = false;
  updateExitConfirmationMethodInvoked = false;
  isConfirmReturnDeliveryMessageReceived = false;
  declarationRequestReceived = false;
  readyForManualAmendment = false;
  autoAmendmentPending = false;
  hasMadeAutoAmendment = false;
  orderProcessed: boolean;
  orderReturnProcessed: boolean;
  direction: Direction;
  orderCancelDate: Date | string | undefined;
  lastActionDate: Date | string | undefined;
  amendmends: AggregateAmendmentData[] = [];
  validDHLEDeclarationStatuses = ['6', '10'];
  declarationResponsesStatuses: DeclarationResponseStatus[] = [];
  declarationResponses: DeclarationResponse[] = [];
  declarationMapping = new Map<
    DeclarationResponse,
    DeclarationResponseStatus
  >();

  //Dictionaries
  confirmReturnDeliveries: Dictionary<ConfirmReturnDelivery> = {};

  constructor(id: string) {
    super();
    this.id = id;
  }

  public submitOrder(order: SubmitOrder): void {
    this.apply(new OrderCreatedEvent(this.id, order));
  }

  public updateOrder(order: SubmitOrder): void {
    this.apply(new OrderUpdatedEvent(this.id, order));
  }

  public cancelOrder(order: CancelOrder): void {
    this.apply(new OrderCancelledEvent(this.id, order));
  }

  public submitReturnOrder(order: ReturnOrder, vcId: string): void {
    this.apply(new OrderReturnedEvent(this.id, order, vcId));
  }

  public confirmReturnDeliveryMessageReceived(
    orderNumber: string,
    vcId: string,
    confirmReturnDelivery: ConfirmReturnDelivery,
  ): void {
    this.apply(
      new ConfirmReturnDeliveryMessageReceivedEvent(
        this.id,
        orderNumber,
        this.order.ecomBusinessCode,
        vcId,
        confirmReturnDelivery,
      ),
    );
  }

  public submitAmendment(
    ecomBusinessCode: string,
    invoiceNumber: string,
    amendment: Amendment,
    returnRequestNumber: string | null = null,
  ): void {
    this.apply(
      new AmendmentCreatedEvent(
        this.id,
        ecomBusinessCode,
        invoiceNumber,
        amendment,
        returnRequestNumber,
      ),
    );
  }

  public lockOrder(invoiceNumber: string, username: string): void {
    this.apply(new OrderLockedEvent(this.id, invoiceNumber, username));
  }

  public unlockOrder(invoiceNumber: string, username: string): void {
    this.apply(new OrderUnlockedEvent(this.id, invoiceNumber, username));
  }

  public addErrorEvent(
    commandName: string,
    errorType: string,
    errorMessage: string,
    errorTime: Date | string,
    isFromException = false, // if set to true it will not make an error chain event
  ): void {
    this.apply(
      new ErrorReceivedEvent(
        this.id,
        commandName,
        errorType,
        errorMessage,
        errorTime,
        isFromException,
      ),
    );
  }

  public processHyperledgerError(
    error: ApplicationError,
    contractType: ContractType,
    contractMethod: ContractMethod,
    vcId?: string,
  ): void {
    this.logger.error(JSON.stringify(error));
    this.apply(
      new InvokeHyperledgerFailedEvent(
        this.id,
        contractType,
        error.errorCode,
        error.descriptiveMessage,
        new Date(error.timestamp),
        contractMethod,
        error.path,
        error.errorName,
        vcId,
        error.errorMessage,
      ),
    );
  }

  public processHyperledgerSubmitOrderResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new SubmitOrderMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerSubmitOrderModeFinalResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new SubmitOrderModeFinalMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerSubmitOrderForAmendmentResponse(
    invoiceNumber: string,
    txnId: string,
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new SubmitOrderMethodInvokedForAmendmentEvent(
        this.id,
        invoiceNumber,
        txnId,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerUpdateTransportInfoResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new UpdateTransportInfoMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerUpdateTransportInfoResponseForAmendment(
    invoiceNumber: string,
    txnId: string,
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new UpdateTransportInfoMethodInvokedForAmendmentEvent(
        this.id,
        invoiceNumber,
        this.order.orderNumber,
        txnId,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerInitiateDeclarationCallResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new InitiateDeclarationCallMethodInvokedEvent(
        this.id,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerInitiateDeclarationCallForAmendmentResponse(
    hyperledgerResponse: HyperledgerResponse,
    invoiceNumber: string,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new InitiateDeclarationCallMethodInvokedForAmendmentEvent(
        this.id,
        invoiceNumber,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processDeliverOrderResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new DeliverOrderMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processReturnDeliverOrderResponse(
    hyperledgerResponse: HyperledgerResponse,
    vcId: string,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new ReturnDeliverOrderMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        vcId,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processConfirmReturnDeliveryResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new ConfirmReturnDeliveryMethodInvokedEvent(
        this.id,
        this.order.ecomBusinessCode,
        this.order.orderNumber,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processUpdateExitConfirmationResponse(
    hyperledgerResponse: HyperledgerResponse,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new UpdateExitConfirmationMethodInvokedEvent(
        this.id,
        this.order.ecomBusinessCode,
        this.order.orderNumber,
        hyperledgerResponse.message.response,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerSubmitReturnOrderResponse(
    hyperledgerResponse: HyperledgerResponse,
    vcId: string,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new SubmitReturnOrderMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        vcId,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerSubmitCancelOrderResponse(
    hyperledgerResponse: HyperledgerResponse,
    vcId: string,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new SubmitCancelOrderMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        vcId,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerSubmitUpdateOrderResponse(
    hyperledgerResponse: HyperledgerResponse,
    vcId: string,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new SubmitUpdateOrderMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        vcId,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processHyperledgerReturnUpdateTransportInfoResponse(
    hyperledgerResponse: HyperledgerResponse,
    vcId: string,
    retriedBy: string | null = null,
    remark: string | null = null,
  ): void {
    this.apply(
      new ReturnUpdateTransportInfoMethodInvokedEvent(
        this.id,
        this.order.orderNumber,
        this.order.ecomBusinessCode,
        hyperledgerResponse.message.response,
        vcId,
        hyperledgerResponse.error,
        retriedBy,
        remark,
      ),
    );
  }

  public processDeclarationDocumentTrackingDataProcessedEvent(
    detailedEvent: DocumentTrackingData,
  ): void {
    this.apply(
      new DeclarationDocumentTrackingDataProcessedEvent(this.id, detailedEvent),
    );
  }

  public processDeclarationResponseSentEvent(
    detailedEvent: DeclarationResponse,
    timeStamp: string,
  ): void {
    this.apply(
      new DHLEDeclarationResponseSentEvent(this.id, detailedEvent, timeStamp),
    );
  }

  public processClaimDocumentTrackingDataProcessedEvent(
    detailedEvent: DocumentTrackingData,
  ): void {
    this.apply(
      new ClaimDocumentTrackingDataProcessedEvent(this.id, detailedEvent),
    );
  }

  public processOrderDataProcessedEvent(
    detailedEvent: OrderData,
    msgType: string,
    txnId: string,
  ): void {
    this.apply(
      new OrderDataProcessedEvent(this.id, msgType, txnId, detailedEvent),
    );
  }

  public processInvoiceDataProcessedEvent(
    invoiceId: string,
    detailedEvent: InvoiceData,
  ): void {
    this.apply(
      new InvoiceDataProcessedEvent(this.id, invoiceId, detailedEvent),
    );
  }

  public processClaimRequestDataProcessedEvent(
    detailedEvent: ClaimRequestData,
  ): void {
    this.apply(new ClaimRequestDataProcessedEvent(this.id, detailedEvent));
  }

  public processDeclarationJsonMappingDataProcessedEvent(
    detailedEvent: DeclarationJsonMappingData,
  ): void {
    this.apply(
      new DeclarationJsonMappingDataProcessedEvent(this.id, detailedEvent),
    );
  }

  public processPickupFile(houseBillData: CheckPointFile): void {
    this.apply(new PickupFileReceivedEvent(this.id, houseBillData));
  }

  public processDfCheckpointFile(houseBillData: CheckPointFile): void {
    this.apply(new DfCheckpointFileReceivedEvent(this.id, houseBillData));
  }

  public processOtherCheckpointFile(checkpointFile: CheckPointFile): void {
    this.apply(new OtherCheckpointFileReceivedEvent(this.id, checkpointFile));
  }

  public processDelivered(checkPointData: CheckPointFile): void {
    this.apply(new DeliveredEvent(this.id, checkPointData));
  }

  public processUndelivered(checkPointData: CheckPointFile): void {
    this.apply(new UndeliveredEvent(this.id, checkPointData));
  }

  public processMasterMovementFile(
    movementData: MasterMovement,
    hawb: string,
  ): void {
    this.apply(
      new MasterMovementFileReceivedEvent(this.id, movementData, hawb),
    );
  }

  public processDetailMovement(movementData: DetailMovement): void {
    this.apply(new DetailMovementReceivedEvent(this.id, movementData));
  }

  public processDeclarationRequest(
    declararationRequestData: DHLEDeclarationRequest,
  ): void {
    this.apply(
      new DeclarationRequestReceivedEvent(this.id, declararationRequestData),
    );
  }

  public processNotificationProcessed(
    orderId: string,
    lookupType: LookupType,
    vcId: string,
    invoiceNumber?: string,
  ): void {
    this.apply(
      new NotificationProcessedReceivedEvent(
        this.id,
        orderId,
        this.ecomBusinessCode,
        lookupType,
        vcId,
        invoiceNumber,
      ),
    );
  }

  private onDeclarationDocumentTrackingDataProcessedEvent(
    event: DeclarationDocumentTrackingDataProcessedEvent,
  ): void {
    const { documentTrackingData } = event;
    const invoice = this.order.invoices.find(
      (x) => x.invoiceNumber === documentTrackingData.invoiceNo,
    );
    let chargeAmount = '';
    let chargeType = '';
    if (documentTrackingData.responseJSONPayload.length !== 0) {
      const parsedResponseJSONPayload: ResponseJSONPayload = JSON.parse(
        documentTrackingData.responseJSONPayload,
      );
      const declarationCharge =
        parsedResponseJSONPayload.DataArea.BOD.ResponseDetails
          .DeclarationCharges[0];
      chargeAmount = declarationCharge.ChargeAmount.toString() ?? '';
      chargeType = declarationCharge.ChargeType.toString() ?? '';
    }

    if (invoice) {
      const existingDeclaration = invoice.declarations?.find(
        (x) => x.hlKey === documentTrackingData.Key,
      );
      if (existingDeclaration) {
        existingDeclaration.batchId = documentTrackingData.requestID;
        existingDeclaration.clearanceStatus =
          declarationType[documentTrackingData.customsStatus] ?? '';
        existingDeclaration.errors = documentTrackingData.errors;
        existingDeclaration.declarationNumber = documentTrackingData.documentNo;
        existingDeclaration.chargeAmount = chargeAmount;
        existingDeclaration.chargeType = chargeType;
      } else {
        const declarationToAdd: Declaration = {
          batchId: documentTrackingData.requestID,
          errors: documentTrackingData.errors,
          declarationNumber: documentTrackingData.documentNo,
          declarationType: documentTrackingData.declarationType,
          clearanceStatus:
            declarationType[documentTrackingData.customsStatus] ?? '',
          version: '',
          shipmentMode: '',
          direction: documentTrackingData.direction,
          returnRequestNo: documentTrackingData.returnRequestNo,
          createdAt: new Date(documentTrackingData.createdAt).toISOString(),
          bodId: '',
          chargeAmount: chargeAmount,
          chargeType: chargeType,
          regimeType: getRegimeType(documentTrackingData.regimeType),
          brokerCode: '',
          exporterCode: '',
          senderIdentification: '',
          numberOfPages: 0,
          errorType: '',
          hlKey: documentTrackingData.Key,
        };
        if (!invoice.declarations) invoice.declarations = [declarationToAdd];
        else invoice.declarations.push(declarationToAdd);
      }

      // Map documentTracking to dhlepayload
      const declarationResponse = this.getOrCreateDeclarationResponseObject(
        documentTrackingData.Key,
      );

      if (declarationResponse) {
        const argumentsObject: DocumentTrackingArguments =
          {} as DocumentTrackingArguments;

        argumentsObject.requestNo = documentTrackingData.requestID;
        argumentsObject.declarationNo = documentTrackingData.documentNo;
        argumentsObject.statusRemarks =
          documentTrackingData.history[0].description;
        argumentsObject.acceptanceDate = new Date(
          documentTrackingData.createdAt,
        ).toISOString();
        declarationResponse.addDocumentTrackingData(argumentsObject);

        declarationResponse.fillCollectionPaymentAdviceLineDetails(
          documentTrackingData.responseJSONPayload,
        );

        declarationResponse.convertCustomsStatus(
          documentTrackingData.customsStatus,
        );

        const status = this.declarationMapping.get(declarationResponse);
        this.updateDeclarationStatus(
          status,
          declarationResponse.result.response.consignments[0]
            .declarationResponse.declarationStatus,
        );
      }

      if (!documentTrackingData.errors || documentTrackingData.errors === '') {
        const eventTime =
          new Date(event.timeStamp).toString() !== 'Invalid Date'
            ? new Date(event.timeStamp)
            : new Date();

        this.eventChain.push({
          eventTime: eventTime,
          eventType: 'Document tracking processed (declaration)',
          exceptions: [],
        });
      } else {
        if (
          this.declarationRequestReceived &&
          declarationType[documentTrackingData.customsStatus] ===
            CustomsStatus.Rejected
        ) {
          if (!this.hasMadeAutoAmendment) {
            this.autoAmendmentPending = true;
          } else {
            this.readyForManualAmendment = true;
          }
        }

        let dataErrors: DocumentTrackingError[] = JSON.parse(
          documentTrackingData.errors,
        );
        if (!Array.isArray(dataErrors)) dataErrors = JSON.parse(dataErrors);
        this.lastActionDate = event.timeStamp
          ? new Date(event.timeStamp)
          : new Date();
        this.eventChain.push({
          eventTime: new Date(event.timeStamp),
          eventType: 'Exception',
          exceptions: dataErrors.map((x) => ({
            exceptionCode: x.errorCode,
            exceptionDetail: `${x.errorType} + " error (Level ${x.level}): " + ${x.errorDescription}`,
          })),
        });
      }
    }
  }

  private onConfirmReturnDeliveryMessageReceivedEvent(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: ConfirmReturnDeliveryMessageReceivedEvent,
  ): void {
    this.lastActionDate = getLastActionDate(null, event.timeStamp);
    this.confirmReturnDeliveries[event.vcId] = event.confirmReturnDelivery;
    this.isConfirmReturnDeliveryMessageReceived = true;
    const { confirmReturnDelivery } = event;

    for (const request of this.returns) {
      const returnInvoice = request.returns.find(
        (x) =>
          x.returnRequestNo === confirmReturnDelivery.returnRequestNo &&
          x.invoiceNumber === confirmReturnDelivery.invoiceNumber,
      );
      if (returnInvoice) {
        returnInvoice.confirmReturn = confirmReturnDelivery;
        break;
      }
    }

    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Confirm return delivery message received',
      exceptions: [],
    });
  }

  private onClaimRequestDataProcessedEvent(
    event: ClaimRequestDataProcessedEvent,
  ): void {
    const declarationNumber =
      event.claimRequestData.DataArea.ClaimCreationRequest.DeclarationNumber;
    for (const invoice of this.order.invoices) {
      const declaration = invoice.declarations?.find(
        (x) => x.declarationNumber === declarationNumber,
      );
      if (declaration) {
        declaration.claimRequest = {
          accountNumber:
            event.claimRequestData.DataArea.ClaimCreationRequest.AccountNumber,
          sender: event.claimRequestData.ApplicationArea.Sender,
          receiver: event.claimRequestData.ApplicationArea.Receiver,
        };
        const eventTime =
          new Date(event.timeStamp).toString() !== 'Invalid Date'
            ? new Date(event.timeStamp)
            : new Date();

        this.eventChain.push({
          eventTime: eventTime,
          eventType: 'Claim request processed',
          exceptions: [],
        });
      }
    }
  }

  private onClaimDocumentTrackingDataProcessedEvent(
    event: ClaimDocumentTrackingDataProcessedEvent,
  ): void {
    const { documentTrackingData } = event;

    const invoice = this.order.invoices.find(
      (x) => x.invoiceNumber === event.documentTrackingData.invoiceNo,
    );
    if (invoice) {
      const existingDeclaration = invoice.declarations?.find((x) => x);
      if (existingDeclaration) {
        existingDeclaration.claim = {
          claimStatus: ClaimType[documentTrackingData.customsStatus] ?? '',
          claimType: documentTrackingData.documentType,
          currentStage: documentTrackingData.currentStage,
          declarationNumber: documentTrackingData.declarationNumber,
          ecomBusinessCode: this.ecomBusinessCode,
          invoiceNumber: documentTrackingData.invoiceNo,
          nrClaimNumber: documentTrackingData.requestID, //Per bug 537
          orderNumber: documentTrackingData.orderNo,
          requestDate: new Date(documentTrackingData.createdAt).toISOString(),
          hlKey: documentTrackingData.Key,
          transportDocumentNumber: documentTrackingData.transportDocumentNo,
        };
        const eventTime =
          new Date(event.timeStamp).toString() !== 'Invalid Date'
            ? new Date(event.timeStamp)
            : new Date();

        this.eventChain.push({
          eventTime: eventTime,
          eventType: 'Document tracking processed (claim)',
          exceptions: [],
        });
      }
    }
  }

  private onOrderDataProcessedEvent(event: OrderDataProcessedEvent): void {
    if (
      event.orderData?.current?.errorBusiness &&
      event.orderData?.current?.errorBusiness.length !== 0
    ) {
      this.updateTransportInfoMethodInvoked = false;
    }
    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Order data processed (HL)',
      exceptions: [],
    });
  }

  private onInvoiceDataProcessedEvent(event: InvoiceDataProcessedEvent): void {
    const invoice = this.order.invoices.find(
      (x) => x.invoiceNumber === event.invoiceId,
    );
    if (invoice) invoice.totalValue = event.invoiceData.current.totalValue;
    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Invoice data processed (HL)',
      exceptions: [],
    });
  }

  private onDeclarationJsonMappingDataProcessedEvent(
    event: DeclarationJsonMappingDataProcessedEvent,
  ) {
    this.status = OrderStatus.InTransit;
    const { declarationJsonMappingData } = event;

    const declarationRequest =
      declarationJsonMappingData.DataArea.BOD.DeclarationRequest;
    for (const declarationInvoice of declarationRequest.ShippingDetails
      .Invoices) {
      const invoice = this.order.invoices.find(
        (x) => x.invoiceNumber === declarationInvoice.InvoiceNumber,
      );
      if (!invoice) {
        continue;
      }
      const existingDeclaration = invoice?.declarations?.find(
        (x) => x.hlKey === declarationJsonMappingData.Key,
      );
      if (existingDeclaration) {
        existingDeclaration.declarationType =
          declarationRequest.DeclarationDetails.DeclarationType;
        existingDeclaration.shipmentMode =
          declarationRequest.OutboundCarrierDetails.TransportMode.toString(); //guess Enum
        existingDeclaration.version =
          declarationJsonMappingData.BODHeader.VersionID;
        existingDeclaration.bodId =
          declarationJsonMappingData.ApplicationArea.BODID;
        existingDeclaration.regimeType = getRegimeType(
          declarationRequest.DeclarationDetails.RegimeType,
        );
        existingDeclaration.declarationType =
          declarationRequest.DeclarationDetails.DeclarationType;
        existingDeclaration.brokerCode =
          declarationRequest.PartiesDetails.BrokerBusinessCode;
        existingDeclaration.exporterCode =
          declarationRequest.PartiesDetails.ConsignorExporterTransferorCode;
        existingDeclaration.senderIdentification =
          declarationJsonMappingData.ApplicationArea.Sender.AuthorizationID;
      } else {
        const declarationToAdd: Declaration = {
          batchId: '',
          errors: '',
          declarationNumber: '',
          declarationType:
            declarationRequest.DeclarationDetails.DeclarationType,
          clearanceStatus: '',
          version: declarationJsonMappingData.BODHeader.VersionID,
          shipmentMode:
            declarationRequest.OutboundCarrierDetails.TransportMode.toString(),
          direction: '',
          returnRequestNo: '',
          createdAt: '',
          bodId: declarationJsonMappingData.ApplicationArea.BODID,
          chargeAmount: '',
          chargeType: '',
          regimeType: getRegimeType(
            declarationRequest.DeclarationDetails.RegimeType,
          ),
          brokerCode: declarationRequest.PartiesDetails.BrokerBusinessCode,
          exporterCode:
            declarationRequest.PartiesDetails.ConsignorExporterTransferorCode,
          senderIdentification:
            declarationJsonMappingData.ApplicationArea.Sender.AuthorizationID,
          numberOfPages: 0,
          errorType: '',
          hlKey: declarationJsonMappingData.Key,
        };
        if (!invoice.declarations) invoice.declarations = [declarationToAdd];
        else invoice.declarations.push(declarationToAdd);
      }
    }

    //Send to DHLE
    const declarationResponse = this.getOrCreateDeclarationResponseObject(
      declarationJsonMappingData.Key,
    );

    if (declarationResponse) {
      const fillObject: JSONMappingArguments = {} as JSONMappingArguments;

      fillObject.msgEntryNo =
        declarationJsonMappingData.ApplicationArea.Sender.ReferenceID;
      fillObject.interchangeControlReference =
        declarationJsonMappingData.ApplicationArea.BODID;
      fillObject.dateTime =
        declarationJsonMappingData.ApplicationArea.CreationDateTime;
      fillObject.messageVersionNumber =
        declarationJsonMappingData.BODHeader.VersionID;
      fillObject.recipientIdentification =
        declarationJsonMappingData.ApplicationArea.Sender.AuthorizationID;
      fillObject.shippingAirlineAgentCode =
        declarationRequest.PartiesDetails.ShippingAirlineAgentBusinessCode;
      fillObject.masterTransportDocumentNo =
        declarationRequest.DeclarationDetails.TransportDocumentDetails.OutboundMasterDocumentNo;
      fillObject.outboundHouseTransportDocumentNo =
        declarationRequest.DeclarationDetails.TransportDocumentDetails.OutboundTransportDocumentNo;
      fillObject.declarantReferenceNo =
        declarationRequest.DeclarationDetails.DeclarantReferenceNo;
      fillObject.declarationType =
        declarationRequest.DeclarationDetails.DeclarationType;

      declarationResponse.addJSONMappingData(fillObject);

      const status = this.declarationMapping.get(declarationResponse);
      this.updateDeclarationStatus(
        status,
        declarationResponse.result.response.consignments[0].declarationResponse
          .declarationStatus,
      );
    }
    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Declaration JSON mapping processed',
      exceptions: [],
    });
  }

  private onNotificationProcessedReceivedEvent(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notificationProcessedEvent: NotificationProcessedReceivedEvent,
  ): void {
    if (notificationProcessedEvent.lookupType === LookupType.Order)
      this.orderProcessed = true;
    if (notificationProcessedEvent.lookupType === LookupType.ReturnOrder) {
      const processed = this.returns.find(
        (x) => x.vcId === notificationProcessedEvent.vcId,
      );
      if (processed) processed.processed = true;
    }

    const eventTime =
      new Date(notificationProcessedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(notificationProcessedEvent.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: `Processed notification received ${notificationProcessedEvent.lookupType}`,
      exceptions: [],
    });
  }

  private onOrderCreatedEvent(orderCreatedEvent: OrderCreatedEvent) {
    this.lastActionDate = getLastActionDate(
      orderCreatedEvent.order.actionDate,
      orderCreatedEvent.timeStamp,
    );
    this.order = orderCreatedEvent.order;
    this.direction = Direction.Outbound;

    this.orderDate = new Date(this.order.actionDate);
    this.ecomBusinessCode = this.order.ecomBusinessCode;
    this.status = OrderStatus.Submitted;

    const eventTime =
      new Date(orderCreatedEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(orderCreatedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Order Created',
      exceptions: [],
    });
  }

  private onOrderUpdatedEvent(orderUpdatedEvent: OrderUpdatedEvent) {
    this.lastActionDate = getLastActionDate(
      orderUpdatedEvent.order.actionDate,
      orderUpdatedEvent.timeStamp,
    );
    nested_object_assign(this.order, orderUpdatedEvent.order);
    if (this.order.mode === ModeType.Return) this.direction = Direction.Return;
    else this.direction = Direction.Outbound;

    const eventTime =
      new Date(orderUpdatedEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(orderUpdatedEvent.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Order Updated',
      exceptions: [],
    });
  }

  private onOrderReturnedEvent(orderReturnedEvent: OrderReturnedEvent) {
    this.lastActionDate = getLastActionDate(
      orderReturnedEvent.order.actionDate,
      orderReturnedEvent.timeStamp,
    );

    this.direction = Direction.Return;
    this.status = OrderStatus.ReturnCreated;

    const returnsToAdd: Return[] = orderReturnedEvent.order.invoices.map(
      (invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        returnRequestNo: invoice.returnDetail.returnRequestNo,
        exporterCode: invoice.exporterCode,
        lineItems: invoice.lineItems.map((x) => ({
          ...x,
          actionDate: orderReturnedEvent.order.actionDate,
        })),
        prevTransportDocNo: invoice.returnDetail.prevTransportDocNo,
        returnReason: invoice.returnDetail.returnReason,
        declarationPurposeDetails:
          invoice.returnDetail.declarationPurposeDetails,
        returnTransportDocNo: invoice.returnDetail.returnTransportDocNo,
        returnJustification: invoice.returnDetail.returnJustification,
      }),
    );

    const returnRequest: ReturnRequest = {
      vcId: orderReturnedEvent.vcId,
      request: orderReturnedEvent.order,
      actionDate: orderReturnedEvent.order.actionDate,
      returns: returnsToAdd,
      processed: false,
      submitted: false,
      delivered: false,
      updatedShipping: false,
    };

    this.returns.push(returnRequest);

    const eventTime =
      new Date(orderReturnedEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(orderReturnedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Order returned',
      exceptions: [],
    });
  }

  private onAmendmentCreatedEvent(
    amendmentCreatedEvent: AmendmentCreatedEvent,
  ) {
    this.status = OrderStatus.InTransit;
    this.order.mode = ModeType.Update;
    this.readyForManualAmendment = false;
    if (this.autoAmendmentPending) {
      this.hasMadeAutoAmendment = true;
      this.autoAmendmentPending = false;
    }

    const amendmentInvoice = this.amendmends.find(
      (amend) => amend.invoiceNumber === amendmentCreatedEvent.invoiceNumber,
    );
    if (amendmentInvoice) {
      amendmentInvoice.txnIdSubmitOrder = '';
      amendmentInvoice.txnIdUpdateTransportInfo = '';
      amendmentInvoice.submitOrderMethodInvokedForAmendment = false;
      amendmentInvoice.updateTransportInfoMethodInvokedForAmendment = false;
      amendmentInvoice.initiateDeclarationcallMethodInvokedForAmendment = false;
    } else {
      this.amendmends.push({
        invoiceNumber: amendmentCreatedEvent.invoiceNumber,
        txnIdSubmitOrder: '',
        txnIdUpdateTransportInfo: '',
        submitOrderMethodInvokedForAmendment: false,
        updateTransportInfoMethodInvokedForAmendment: false,
        initiateDeclarationcallMethodInvokedForAmendment: false,
      });
    }

    if (amendmentCreatedEvent.amendment.invoiceDate) {
      amendmentCreatedEvent.amendment.invoiceDate = new Date(
        amendmentCreatedEvent.amendment.invoiceDate,
      ).toISOString();
    }

    const inv: Invoice | undefined = this.order.invoices.find(
      (i) => i.invoiceNumber === amendmentCreatedEvent.invoiceNumber,
    );

    if (inv) {
      inv.mode = ModeType.Update;
      inv.incoTerm = amendmentCreatedEvent.amendment.incoTerm ?? inv.incoTerm;
      inv.totalNoOfInvoicePages =
        amendmentCreatedEvent.amendment.totalNoOfInvoicePages ??
        inv.totalNoOfInvoicePages;

      inv.invoiceDate = amendmentCreatedEvent.amendment.invoiceDate
        ? new Date(amendmentCreatedEvent.amendment.invoiceDate).toISOString()
        : inv.invoiceDate;

      amendmentCreatedEvent.amendment.orderLines.forEach((newLineItem) => {
        const oldLineItem = inv.lineItems.find(
          (ol) => ol.lineNo === newLineItem.lineNumber,
        );
        if (oldLineItem) {
          oldLineItem.mode = ModeType.Update;
          oldLineItem.netWeight = newLineItem.weight
            ? Number(newLineItem.weight)
            : Number(oldLineItem.netWeight);
          oldLineItem.netWeightUOM =
            newLineItem.weightUnit ?? oldLineItem.netWeightUOM;
          oldLineItem.hscode = newLineItem.commodityCode ?? oldLineItem.hscode;
          oldLineItem.description =
            newLineItem.description ?? oldLineItem.description;
          oldLineItem.quantity = newLineItem.quantity
            ? parseFloat(newLineItem.quantity)
            : oldLineItem.quantity;
          oldLineItem.quantityUOM =
            newLineItem.quantityUnit ?? oldLineItem.quantityUOM;
          oldLineItem.supplementaryQuantityUOM =
            newLineItem.supplQuantityUnit ??
            oldLineItem.supplementaryQuantityUOM;
          oldLineItem.goodsCondition =
            newLineItem.goodsCondition ?? oldLineItem.goodsCondition;
        }
      });
      const dec = inv.declarations?.find(
        (x) =>
          x.clearanceStatus === declarationType['16'] ||
          x.clearanceStatus === declarationType['500'],
      );
      if (dec) dec.clearanceStatus = declarationType['2']; //switch declaration to submitted again
    }

    const eventTime =
      new Date(amendmentCreatedEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(amendmentCreatedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Amendment submitted',
      exceptions: [],
    });
  }

  private onPickupFileReceivedEvent(
    incomingPickupFileEvent: PickupFileReceivedEvent,
  ) {
    this.status = OrderStatus.InTransit;

    const { pickupFileData } = incomingPickupFileEvent;
    const actionDate =
      pickupFileData.eventDate && pickupFileData.eventGMT
        ? pickupFileData.eventDate + pickupFileData.eventGMT
        : '';

    const houseBill = {
      airwayBillNumber: pickupFileData.hawb,
      declaredValue:
        pickupFileData.shipmentDeclaredValue && pickupFileData.shipmentCurrency
          ? `${pickupFileData.shipmentDeclaredValue} ${pickupFileData.shipmentCurrency}`
          : '',
      numberOfPackages: Number(pickupFileData.numberOfPackages) ?? 0,
      volumeAndQualifier:
        pickupFileData.volumeWeight && pickupFileData.weightQualifier
          ? `${pickupFileData.volumeWeight} ${pickupFileData.weightQualifier}`
          : '',
      weightAndQualifier:
        pickupFileData.weight && pickupFileData.weightQualifier
          ? `${pickupFileData.weight} ${pickupFileData.weightQualifier}`
          : '',
      eventDate: new Date(actionDate),
    };

    if (!this.houseBills) {
      this.houseBills = [houseBill];
      return;
    }
    const indexOfExistingBill = this.houseBills.findIndex(
      (x) => x.airwayBillNumber === pickupFileData.hawb,
    );
    if (indexOfExistingBill >= 0)
      this.houseBills[indexOfExistingBill] = houseBill;
    else this.houseBills.push(houseBill);

    if (this.direction === Direction.Return && this.returns.length > 0) {
      const filteredReturns = this.returns.filter(
        (x) => !x.pickupFile && x.processed === true,
      );
      filteredReturns.sort(function (a, b) {
        const dateA = new Date(a.actionDate).getTime();
        const dateB = new Date(b.actionDate).getTime();
        return dateA < dateB ? -1 : 1;
      });
      filteredReturns[0].pickupFile = { ...pickupFileData };
    } else {
      this.pickupFile = { ...pickupFileData }; //current pickup file
      this.pickupFileAdded = true;
    }

    const eventTime =
      new Date(incomingPickupFileEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(incomingPickupFileEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Shipment pickup',
      exceptions: [],
    });
  }

  private onDeliveredEvent(incomingDeliveredEvent: DeliveredEvent) {
    this.status = OrderStatus.Delivered;

    const checkPointData = incomingDeliveredEvent.checkPointData;
    const deliveryDate =
      checkPointData.eventDate && checkPointData.eventGMT
        ? checkPointData.eventDate + checkPointData.eventGMT
        : '';
    this.delivered = this.delivered ?? [];
    const existingDelivered = this.delivered.find(
      (x) =>
        x.transportDocumentNumber === checkPointData.hawb &&
        x.deliveryCode === 'OK',
    );
    if (existingDelivered) {
      existingDelivered.deliveryDate = new Date(deliveryDate);
    } else {
      this.delivered.push({
        airwayBillNumber: checkPointData.hawb,
        deliverTo: '', //empty for now / removed
        deliveryDate: new Date(deliveryDate),
        deliveryStatus: checkPointData.eventRemark ?? '', //empty for now
        deliveryType: '', //empty for now / removed
        documents: '', //empty for now / removed
        returnTo: '', //empty for now / removed
        origin: checkPointData.origin ?? '',
        destination: checkPointData.destination ?? '',
        signature: '', //empty for now / removed
        transportDocumentNumber: checkPointData.hawb,
        type: 'Delivered',
        deliveryCode: checkPointData.eventCode ?? '',
      });
    }
    if (this.direction === Direction.Return) {
      const returnOrderIndex = this.returns.findIndex(
        (x) => x.pickupFile?.hawb === checkPointData.hawb,
      );
      if (returnOrderIndex >= 0) {
        this.returns[returnOrderIndex].deliveredTime =
          checkPointData.ETADateTime;
        this.returns[returnOrderIndex].deliveredDate = deliveryDate;
      } else
        this.logger.error(
          `delivered checkpoint file could not be matched to a return request with hawb ${checkPointData.hawb}`,
        );
    }
    const eventTime =
      new Date(incomingDeliveredEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(incomingDeliveredEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Delivery',
      exceptions: [],
    });
  }

  //Do not know business impact of this method so used same as delivered for now.
  private onUndeliveredEvent(incomingUndeliveredEvent: UndeliveredEvent) {
    const checkPointData = incomingUndeliveredEvent.checkPointData;
    const deliveryDate =
      checkPointData.eventDate && checkPointData.eventGMT
        ? checkPointData.eventDate + checkPointData.eventGMT
        : '';
    this.delivered = this.delivered ?? [];

    this.delivered.push({
      airwayBillNumber: this.movementData.airwayBillNumber,
      deliverTo: '', //empty for now / removed
      deliveryDate: new Date(deliveryDate),
      deliveryStatus: checkPointData.eventRemark ?? '', //empty for now
      deliveryType: '', //empty for now / removed
      documents: '', //empty for now / removed
      returnTo: '', //empty for now / removed
      origin: checkPointData.origin ?? '',
      destination: checkPointData.destination ?? '',
      signature: '', //empty for now / removed
      transportDocumentNumber: checkPointData.hawb,
      type: 'Undelivered',
      deliveryCode: checkPointData.eventCode ?? '',
    });

    const eventTime =
      new Date(incomingUndeliveredEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(incomingUndeliveredEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: `Delivery attempted ${checkPointData.eventCode ?? ''}`,
      exceptions: [],
    });
  }

  private onDfCheckpointFileReceivedEvent(
    dfCheckpointFileReceivedEvent: DfCheckpointFileReceivedEvent,
  ) {
    this.dfCheckpointFileReceivedEvent = true;
    const { checkpointFileData } = dfCheckpointFileReceivedEvent;
    const deliveryDate =
      checkpointFileData.eventDate && checkpointFileData.eventGMT
        ? checkpointFileData.eventDate + checkpointFileData.eventGMT
        : '';

    this.delivered.push({
      airwayBillNumber: checkpointFileData.hawb,
      deliverTo: '', //empty for now / removed
      deliveryDate: new Date(deliveryDate),
      deliveryStatus: checkpointFileData.eventRemark ?? '', //empty for now
      deliveryType: '', //empty for now / removed
      documents: '', //empty for now / removed
      returnTo: '', //empty for now / removed
      origin: checkpointFileData.origin ?? '',
      destination: checkpointFileData.destination ?? '',
      signature: '', //empty for now / removed
      transportDocumentNumber: checkpointFileData.hawb,
      type: 'DF',
      deliveryCode: checkpointFileData.eventCode ?? '',
    });

    const eventTime =
      new Date(dfCheckpointFileReceivedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(dfCheckpointFileReceivedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'DF checkpoint file received',
      exceptions: [],
    });
  }

  private onOtherCheckpointFileReceivedEvent(
    otherCheckpointFileEvent: OtherCheckpointFileReceivedEvent,
  ) {
    const { checkpointFileData } = otherCheckpointFileEvent;

    const deliveryDate =
      checkpointFileData.eventDate && checkpointFileData.eventGMT
        ? checkpointFileData.eventDate + checkpointFileData.eventGMT
        : '';

    this.delivered.push({
      airwayBillNumber: checkpointFileData.hawb,
      deliverTo: '', //empty for now / removed
      deliveryDate: new Date(deliveryDate),
      deliveryStatus: checkpointFileData.eventRemark ?? '', //empty for now
      deliveryType: '', //empty for now / removed
      documents: '', //empty for now / removed
      returnTo: '', //empty for now / removed
      origin: checkpointFileData.origin ?? '',
      destination: checkpointFileData.destination ?? '',
      signature: '', //empty for now / removed
      transportDocumentNumber: checkpointFileData.hawb,
      type: 'Other',
      deliveryCode: checkpointFileData.eventCode ?? '',
    });

    const eventTime =
      new Date(otherCheckpointFileEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(otherCheckpointFileEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: `${
        checkpointFileData.eventCode ?? ''
      } checkpoint file received`,
      exceptions: [],
    });
  }

  private onMasterMovementFileReceivedEvent(
    incomingMovementFileEvent: MasterMovementFileReceivedEvent,
  ) {
    let movementGMT = parseGMTOffset(
      incomingMovementFileEvent.masterMovementFile.movementGMT,
    );
    if (!movementGMT) {
      this.logger.error(`Invalid GMT offset, defaulting to empty string`);
      movementGMT = '';
    }

    const movementData = {
      type: 'Master',
      mawb: incomingMovementFileEvent.masterMovementFile.mawbNumber, //Master Air Way Bill
      hawb: '',
      airwayBillNumber: '',
      flightNumber: incomingMovementFileEvent.masterMovementFile.movementNumber,
      shippingParameterId: '',
      referenceID: '',
      mode: this.order.mode,
      broker: this.order.invoices[0].brokerBusinessCode ?? '',
      agent: this.order.invoices[0].exporterCode ?? '',
      cargoHandler: '',
      movementDestination:
        incomingMovementFileEvent.masterMovementFile.movementDestination,
      movementNumber:
        incomingMovementFileEvent.masterMovementFile.movementNumber,
      movementOrigin:
        incomingMovementFileEvent.masterMovementFile.movementOrigin,
      movementOriginCountry:
        incomingMovementFileEvent.masterMovementFile.movementOriginCountry,
      shippingDetails: {
        modeOfTransport: '1',
        carrierNumber:
          incomingMovementFileEvent.masterMovementFile.movementNumber,
        dateOfArrival:
          incomingMovementFileEvent.masterMovementFile.movementDepartureDate,
        dateOfDeparture:
          incomingMovementFileEvent.masterMovementFile.movementDepartureDate,
        movementGMT: movementGMT,
        timeOfDeparture:
          incomingMovementFileEvent.masterMovementFile.movementDepartureTime,
        portOfLoad: '',
        portOfDischarge: '',
        originalLoadPort: '',
        destinationCountry: '',
        pointOfExit: '',
        LDMBusinessCode: '',
      },
      packageDetails: {
        packageType: '',
        numberOfPackages: 0,
        containerNumber: '',
        cargoType: '',
        netWeight: 0,
        netWeightUOM: incomingMovementFileEvent.masterMovementFile.weightUnit,
        containerSize: '',
        containerType: '',
        containerSealNumber: '',
        grossWeight: 0,
        grossWeightUOM: incomingMovementFileEvent.masterMovementFile.weightUnit,
        volumetricWeight: 0,
        volumetricWeightUOM:
          incomingMovementFileEvent.masterMovementFile.weightUnit ??
          UnitOfMeasurement.CubicMeters,
      },
    };

    if (this.direction === Direction.Return) {
      const indexOfReturn = this.returns.findIndex(
        (x) => x.pickupFile?.hawb === incomingMovementFileEvent.hawb,
      );
      if (indexOfReturn >= 0) {
        this.returns[indexOfReturn].masterMovement =
          incomingMovementFileEvent.masterMovementFile;
        this.returns[indexOfReturn].movementData = movementData;
      } else
        this.logger.error(
          `master movement could not be matched to a return request with hawb: ${incomingMovementFileEvent.hawb}}`,
        );
    } else {
      this.movementData = movementData;
    }

    const eventTime =
      new Date(incomingMovementFileEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(incomingMovementFileEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Master movement received',
      exceptions: [],
    });
  }

  private onDetailMovementReceivedEvent(
    incomingMovementFileEvent: DetailMovementReceivedEvent,
  ) {
    let currentMovement;
    if (this.direction === Direction.Return) {
      const indexOfReturn = this.returns.findIndex(
        (x) =>
          x.masterMovement?.mawbNumber ===
          incomingMovementFileEvent.detailMovementFile.mawbNumber,
      );
      if (indexOfReturn >= 0) {
        this.returns[indexOfReturn].detailMovement =
          incomingMovementFileEvent.detailMovementFile;
        currentMovement = this.returns[indexOfReturn].movementData;
      } else
        this.logger.error(
          `detail movement could not be matched to a return request with mawb: ${incomingMovementFileEvent.detailMovementFile.mawbNumber}}`,
        );
    } else {
      currentMovement = this.movementData;
    }

    const cargoHandler =
      incomingMovementFileEvent.detailMovementFile.handlingUnitNumber &&
      incomingMovementFileEvent.detailMovementFile.handlingUnitNumber.length > 0
        ? incomingMovementFileEvent.detailMovementFile.handlingUnitNumber
        : EcomBusinessCodeLookup[this.ecomBusinessCode]
            ?.cargoHandlerPremiseCode;

    if (currentMovement) {
      currentMovement.type = 'MasterAndDetail';
      currentMovement.airwayBillNumber =
        incomingMovementFileEvent.detailMovementFile.airwayBillNumber;
      currentMovement.cargoHandler = cargoHandler ?? '';
      currentMovement.shippingDetails = {
        modeOfTransport: '1',
        carrierNumber: '',
        dateOfArrival: currentMovement.shippingDetails.dateOfArrival,
        dateOfDeparture: currentMovement.shippingDetails.dateOfArrival,
        timeOfDeparture: currentMovement.shippingDetails.timeOfDeparture,
        movementGMT: currentMovement.shippingDetails.movementGMT,
        portOfLoad: incomingMovementFileEvent.detailMovementFile.shipmentOrigin,
        portOfDischarge:
          incomingMovementFileEvent.detailMovementFile.shipmentDestination,
        originalLoadPort:
          incomingMovementFileEvent.detailMovementFile.shipmentOrigin,
        destinationCountry:
          incomingMovementFileEvent.detailMovementFile.shipmentDestination,
        pointOfExit:
          incomingMovementFileEvent.detailMovementFile.shipmentDestination,
        LDMBusinessCode: 'AE-1005666',
      };
      currentMovement.packageDetails = {
        packageType:
          incomingMovementFileEvent.detailMovementFile.item.unitOfMeasure,
        numberOfPackages:
          Number(
            incomingMovementFileEvent.detailMovementFile.totalPiecesInShipment,
          ) ?? 0,
        containerNumber: '',
        cargoType: '',
        netWeight: Number(
          incomingMovementFileEvent.detailMovementFile.shipmentActualWeight,
        ),
        containerSize: '',
        containerType: '',
        containerSealNumber: '',
        grossWeight: Number(
          incomingMovementFileEvent.detailMovementFile.shipmentActualWeight,
        ),
        grossWeightUOM: currentMovement.packageDetails?.grossWeightUOM,
        netWeightUOM: currentMovement.packageDetails?.netWeightUOM,
        volumetricWeightUOM:
          currentMovement.packageDetails?.volumetricWeightUOM,
        volumetricWeight: Number(
          incomingMovementFileEvent.detailMovementFile
            .shipmentDeclaredVolumeWeight,
        ),
      };
    }

    const eventTime =
      new Date(incomingMovementFileEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(incomingMovementFileEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Detail movement received',
      exceptions: [],
    });
  }

  private onDeclarationRequestReceivedEvent(
    incomingDeclarationRequestEvent: DeclarationRequestReceivedEvent,
  ) {
    this.declarationRequestReceived = true;

    const declarationRequest =
      incomingDeclarationRequestEvent.declarationRequestData;
    const declarationBatchHeader = declarationRequest.Declaration.BatchHeader;
    const transportDocumentDetails =
      declarationRequest.Declaration.Consignments.DeclarationDetails
        .TransportDocumentDetails[0];
    const carrierDetails: DHLECarrierDetails = this.getOutboundOrInboundValue(
      declarationBatchHeader.OutboundCarrierDetails,
      declarationBatchHeader.InboundCarrierDetails,
    );
    const mawb = this.getOutboundOrInboundValue(
      declarationBatchHeader.OutboundMasterDocumentNo,
      declarationBatchHeader.InboundMasterDocumentNo,
    );
    const hawb = this.getOutboundOrInboundValue(
      transportDocumentDetails.OutboundTransportDocumentNo,
      transportDocumentDetails.InboundTransportDocumentNo,
    );
    const declarationRequestData =
      incomingDeclarationRequestEvent.declarationRequestData;
    const movementGMT = getGMTOffset(declarationRequestData.UNB.DateTime) ?? '';

    const cargoHandler =
      declarationBatchHeader.CTOCargoHandlerPremisesCode &&
      declarationBatchHeader.CTOCargoHandlerPremisesCode.length > 0
        ? declarationBatchHeader.CTOCargoHandlerPremisesCode
        : EcomBusinessCodeLookup[this.ecomBusinessCode]
            ?.cargoHandlerPremiseCode;

    const movementData = {
      type: 'DeclarationRequest',
      mawb: mawb,
      hawb: hawb,
      airwayBillNumber: hawb,
      flightNumber: carrierDetails.CarrierRegistrationNo,
      shippingParameterId: '',
      referenceID: declarationRequest.UNH.MessageReferenceNumber,
      mode: this.order.mode,
      broker: this.order.invoices[0].brokerBusinessCode ?? '',
      agent: this.order.invoices[0].exporterCode ?? '',
      cargoHandler: cargoHandler ?? '',
      movementDestination:
        declarationRequest.Declaration.Consignments.ShippingDetails
          .DestinationCountry ?? '',
      movementNumber: carrierDetails.CarrierRegistrationNo,
      movementOrigin: '',
      movementOriginCountry: '',
      shippingDetails: {
        modeOfTransport: '1',
        carrierNumber: carrierDetails.CarrierRegistrationNo,
        dateOfArrival: carrierDetails.DateOfArrival ?? '',
        dateOfDeparture: carrierDetails.DateOfDeparture ?? '',
        movementGMT: movementGMT,
        timeOfDeparture: carrierDetails.DateOfDeparture ?? '',
        portOfLoad: declarationBatchHeader.PortOfLoading,
        portOfDischarge: declarationBatchHeader.PortOfDischarge,
        originalLoadPort: declarationBatchHeader.PortOfLoading,
        destinationCountry:
          declarationRequest.Declaration.Consignments.ShippingDetails
            .DestinationCountry ?? '',
        pointOfExit:
          declarationRequest.Declaration.Consignments.ShippingDetails
            .ExitPort ?? '',
        LDMBusinessCode: declarationRequest.UNB.SenderIdentification,
      },
      packageDetails: {
        packageType: transportDocumentDetails.PackageDetails[0].PackageType,
        numberOfPackages:
          transportDocumentDetails.PackageDetails[0].TotalNumberOfPackages,
        containerNumber: '',
        cargoType: transportDocumentDetails.CargoTypePackageCode,
        netWeight: transportDocumentDetails.TotalNetWeight,
        netWeightUOM: transportDocumentDetails.NetWeightUnit,
        containerSize: '',
        containerType: '',
        containerSealNumber: '',
        grossWeight: transportDocumentDetails.TotalGrossWeight,
        grossWeightUOM: transportDocumentDetails.GrossWeightUnit,
        volumetricWeight: Number(transportDocumentDetails.Volume) ?? 0,
        volumetricWeightUOM:
          transportDocumentDetails.VolumeUnit ?? UnitOfMeasurement.CubicMeters,
      },
    };

    if (this.direction === Direction.Return) {
      const indexOfReturn = this.returns.findIndex(
        (x) => x.pickupFile?.hawb === hawb,
      );
      if (indexOfReturn >= 0) {
        this.returns[indexOfReturn].declarationRequest = declarationRequestData;
        this.returns[indexOfReturn].movementData = movementData;
      } else
        this.logger.error(
          `Declaration request could not be matched to a return request with hawb: ${hawb}}`,
        );
    } else {
      this.declarationRequest = declarationRequestData;
      this.movementData = movementData;
    }

    const eventTime =
      new Date(incomingDeclarationRequestEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(incomingDeclarationRequestEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Declaration request received (DHLE)',
      exceptions: [],
    });
  }

  private onOrderLockedEvent(orderLockedEvent: OrderLockedEvent) {
    const invoice = this.order.invoices.find(
      (x) => x.invoiceNumber === orderLockedEvent.invoiceNumber,
    );
    if (invoice) {
      invoice.locked = true;
      invoice.lockedBy = orderLockedEvent.username;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onOrderUnlockedEvent(orderUnlockedEvent: OrderUnlockedEvent) {
    const invoice = this.order.invoices.find(
      (x) => x.invoiceNumber === orderUnlockedEvent.invoiceNumber,
    );
    if (invoice) {
      invoice.locked = false;
      invoice.lockedBy = undefined;
    }
  }

  private onSubmitOrderMethodInvokedEvent(
    submitOrderMethodInvokedEvent: SubmitOrderMethodInvokedEvent,
  ) {
    if (
      !submitOrderMethodInvokedEvent.error ||
      submitOrderMethodInvokedEvent.error === ''
    ) {
      this.submitOrderMethodInvoked = true;
    }

    const eventTime =
      new Date(submitOrderMethodInvokedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(submitOrderMethodInvokedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Submit order invoked (HL)',
      exceptions: [],
    });
  }

  private onSubmitOrderMethodInvokedForAmendmentEvent(
    submitOrderMethodInvokedForAmendmentEvent: SubmitOrderMethodInvokedForAmendmentEvent,
  ) {
    if (
      !submitOrderMethodInvokedForAmendmentEvent.error ||
      submitOrderMethodInvokedForAmendmentEvent.error === ''
    ) {
      const amendmentInvoice = this.amendmends.find(
        (inv) =>
          inv.invoiceNumber ===
          submitOrderMethodInvokedForAmendmentEvent.invoiceNumber,
      );
      if (amendmentInvoice) {
        amendmentInvoice.txnIdSubmitOrder =
          submitOrderMethodInvokedForAmendmentEvent.txnId;
        amendmentInvoice.submitOrderMethodInvokedForAmendment = true;
      }
    }

    const eventTime =
      new Date(
        submitOrderMethodInvokedForAmendmentEvent.timeStamp,
      ).toString() !== 'Invalid Date'
        ? new Date(submitOrderMethodInvokedForAmendmentEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Submit order invoked for amendment (HL)',
      exceptions: [],
    });
  }

  private onUpdateTransportInfoMethodInvokedEvent(
    updateTransportInfoMethodInvokedEvent: UpdateTransportInfoMethodInvokedEvent,
  ) {
    if (
      !updateTransportInfoMethodInvokedEvent.error ||
      updateTransportInfoMethodInvokedEvent.error === ''
    ) {
      this.updateTransportInfoMethodInvoked = true;
    }

    const eventTime =
      new Date(updateTransportInfoMethodInvokedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(updateTransportInfoMethodInvokedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Update transport invoked (HL)',
      exceptions: [],
    });
  }

  private onUpdateTransportInfoMethodInvokedForAmendmentEvent(
    updateTransportInfoMethodInvokedForAmendmentEvent: UpdateTransportInfoMethodInvokedForAmendmentEvent,
  ) {
    if (
      !updateTransportInfoMethodInvokedForAmendmentEvent.error ||
      updateTransportInfoMethodInvokedForAmendmentEvent.error === ''
    ) {
      const amendmentInvoice = this.amendmends.find(
        (inv) =>
          inv.invoiceNumber ===
          updateTransportInfoMethodInvokedForAmendmentEvent.invoiceNumber,
      );
      if (amendmentInvoice) {
        amendmentInvoice.txnIdUpdateTransportInfo =
          updateTransportInfoMethodInvokedForAmendmentEvent.txnId;
        amendmentInvoice.updateTransportInfoMethodInvokedForAmendment = true;
      }
    }

    const eventTime =
      new Date(
        updateTransportInfoMethodInvokedForAmendmentEvent.timeStamp,
      ).toString() !== 'Invalid Date'
        ? new Date(updateTransportInfoMethodInvokedForAmendmentEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Update transport invoked for amendment (HL)',
      exceptions: [],
    });
  }

  private onInitiateDeclarationCallMethodInvokedEvent(
    initiateDeclarationcallMethodInvokedEvent: InitiateDeclarationCallMethodInvokedEvent,
  ) {
    if (
      !initiateDeclarationcallMethodInvokedEvent.error ||
      initiateDeclarationcallMethodInvokedEvent.error === ''
    ) {
      this.initiateDeclarationcallMethodInvoked = true;
    }

    const eventTime =
      new Date(
        initiateDeclarationcallMethodInvokedEvent.timeStamp,
      ).toString() !== 'Invalid Date'
        ? new Date(initiateDeclarationcallMethodInvokedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Initiate declaration invoked (HL)',
      exceptions: [],
    });
  }

  private onInitiateDeclarationCallMethodInvokedForAmendmentEvent(
    initiateDeclarationcallMethodInvokedForAmendmentEvent: InitiateDeclarationCallMethodInvokedForAmendmentEvent,
  ) {
    if (
      !initiateDeclarationcallMethodInvokedForAmendmentEvent.error ||
      initiateDeclarationcallMethodInvokedForAmendmentEvent.error === ''
    ) {
      const amendmentInvoice = this.amendmends.find(
        (inv) =>
          inv.invoiceNumber ===
          initiateDeclarationcallMethodInvokedForAmendmentEvent.invoiceNumber,
      );
      if (amendmentInvoice) {
        amendmentInvoice.initiateDeclarationcallMethodInvokedForAmendment =
          true;
      }
    }

    const eventTime =
      new Date(
        initiateDeclarationcallMethodInvokedForAmendmentEvent.timeStamp,
      ).toString() !== 'Invalid Date'
        ? new Date(
            initiateDeclarationcallMethodInvokedForAmendmentEvent.timeStamp,
          )
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Initiate declaration invoked for amendment (HL)',
      exceptions: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onErrorReceivedEvent(errorEvent: ErrorReceivedEvent) {
    if (!errorEvent.isFromException) {
      const { errorTime, ...rest } = errorEvent;
      const validErrorTime =
        new Date(errorTime).toString() !== 'Invalid Date'
          ? new Date(errorTime)
          : new Date();

      this.errorEvents.push({
        errorTime: validErrorTime,
        ...rest,
      });

      this.eventChain.push({
        eventTime: validErrorTime,
        eventType: `${errorEvent.eventType} - error: ${errorEvent.errorCode}`,
        exceptions: [],
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onOrderCancelledEvent(orderCancelledEvent: OrderCancelledEvent) {
    this.lastActionDate = getLastActionDate(
      orderCancelledEvent.cancelOrder.actionDate,
      orderCancelledEvent.timeStamp,
    );
    this.status = OrderStatus.OrderCancelled;
    this.order.mode = ModeType.Cancel;
    this.orderCancelDate = orderCancelledEvent.cancelOrder.actionDate;

    orderCancelledEvent.cancelOrder.invoices.forEach((cancelInv) => {
      const currInv = this.order.invoices.find(
        (i) => i.invoiceNumber === cancelInv.invoiceNumber,
      );
      if (currInv) {
        currInv.mode = ModeType.Cancel;
        currInv.cancellationReason = cancelInv.cancellationReason;
        currInv.lineItems = currInv.lineItems.map((currLineItem) => {
          return {
            ...currLineItem,
            mode: ModeType.Cancel,
          };
        });
      }
    });

    const eventTime =
      new Date(orderCancelledEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(orderCancelledEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Order cancelled',
      exceptions: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onInvokeHyperledgerFailedEvent(
    failedEvent: InvokeHyperledgerFailedEvent,
  ) {
    const eventTime =
      new Date(failedEvent.timeStamp).toString() !== 'Invalid Date'
        ? new Date(failedEvent.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Invoke hyperledger failed',
      exceptions: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onConfirmReturnDeliveryMethodInvokedEvent(
    confirmDeliveryMethodInvokedEvent: ConfirmReturnDeliveryMethodInvokedEvent,
  ) {
    this.confirmReturnDeliveryMethodInvoked = true;

    const eventTime =
      new Date(confirmDeliveryMethodInvokedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(confirmDeliveryMethodInvokedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Confirm receipt of the returned good/s',
      exceptions: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onDeliverOrderMethodInvokedEvent(
    deliverOrderMethodInvokedEvent: DeliverOrderMethodInvokedEvent,
  ) {
    this.deliverOrderMethodInvoked = true;

    const eventTime =
      new Date(deliverOrderMethodInvokedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(deliverOrderMethodInvokedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Process deliver order method invoked',
      exceptions: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onSubmitOrderModeFinalMethodInvokedEvent(
    submitOrderModeFinalMethodInvokedEvent: SubmitOrderModeFinalMethodInvokedEvent,
  ) {
    this.submitOrderModeFinalMethodInvoked = true;

    const eventTime =
      new Date(submitOrderModeFinalMethodInvokedEvent.timeStamp).toString() !==
      'Invalid Date'
        ? new Date(submitOrderModeFinalMethodInvokedEvent.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Submit order invoked(final) (HL)',
      exceptions: [],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onUpdateExitConfirmationMethodInvokedEvent(
    event: UpdateExitConfirmationMethodInvokedEvent,
  ) {
    this.updateExitConfirmationMethodInvoked = true;

    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Update exit confirmation invoked (HL)',
      exceptions: [],
    });
  }

  private onSubmitReturnOrderMethodInvokedEvent(
    event: SubmitReturnOrderMethodInvokedEvent,
  ) {
    const toToggle = this.returns.find((x) => x.vcId === event.vcId);
    if (toToggle) toToggle.submitted = true;

    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Submit return order invoked (HL)',
      exceptions: [],
    });
  }

  private onReturnUpdateTransportInfoMethodInvokedEvent(
    event: ReturnUpdateTransportInfoMethodInvokedEvent,
  ) {
    const toToggle = this.returns.find((x) => x.vcId === event.vcId);
    if (toToggle) toToggle.updatedShipping = true;

    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Update transport invoked for return (HL)',
      exceptions: [],
    });
  }

  private onReturnDeliverOrderMethodInvokedEvent(
    event: ReturnDeliverOrderMethodInvokedEvent,
  ) {
    const toToggle = this.returns.find((x) => x.vcId === event.vcId);
    if (toToggle) toToggle.delivered = true;

    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Deliver order invoked for return (HL)',
      exceptions: [],
    });
  }

  private onSubmitCancelOrderMethodInvokedEvent(
    event: SubmitCancelOrderMethodInvokedEvent,
  ) {
    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();
    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Cancel order invoked (HL)',
      exceptions: [],
    });
  }

  private onSubmitUpdateOrderMethodInvokedEvent(
    event: SubmitUpdateOrderMethodInvokedEvent,
  ) {
    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'Update order invoked (HL)',
      exceptions: [],
    });
  }

  private onDHLEDeclarationResponseSentEvent(
    event: DHLEDeclarationResponseSentEvent,
  ) {
    const eventTime =
      new Date(event.timeStamp).toString() !== 'Invalid Date'
        ? new Date(event.timeStamp)
        : new Date();

    this.eventChain.push({
      eventTime: eventTime,
      eventType: 'DHLE Declaration Response sent',
      exceptions: [],
    });
  }

  private getOutboundOrInboundValue(outbound: any, inbound: any): any {
    const value = this.direction == Direction.Outbound ? outbound : inbound;
    if (!value && (outbound instanceof String || inbound instanceof String))
      return '';
    return value;
  }

  public isDeclarationResponseComplete(key: string): boolean {
    const declarationResponseStatus = this.declarationResponsesStatuses.find(
      (responseStatus) => {
        return responseStatus.key === key;
      },
    );
    if (declarationResponseStatus?.isFilled === FillStatus.Complete) {
      return true;
    }
    return false;
  }

  public getDeclarationResponseFromMapping(key: string): DeclarationResponse {
    let declarationResponse;
    this.declarationMapping.forEach((responseStatus, response) => {
      if (responseStatus.key === key) {
        declarationResponse = response;
      }
    });
    if (!declarationResponse) {
      throw new Error(`Incorrect key given`);
    }
    return declarationResponse;
  }

  private getOrCreateDeclarationResponseObject(
    key: string,
  ): DeclarationResponseClass | null {
    let declarationResponse;
    let declarationResponseStatus;

    this.declarationMapping.forEach((responseStatus, response) => {
      if (responseStatus.key === key) {
        declarationResponseStatus = responseStatus;
        declarationResponse = response;
      }
    });
    if (!declarationResponse) {
      declarationResponse = new DeclarationResponseClass();
      declarationResponseStatus = {
        key,
        isFilled: FillStatus.Empty,
      };
      this.declarationMapping.set(
        declarationResponse,
        declarationResponseStatus,
      );
      this.declarationResponsesStatuses.push(declarationResponseStatus);
      this.declarationResponses.push(declarationResponse);
    }
    return declarationResponse;
  }

  private updateDeclarationStatus(
    status: DeclarationResponseStatus | undefined,
    declarationStatus: string,
  ): void {
    if (status) {
      if (status.isFilled === FillStatus.Empty) {
        status.isFilled = FillStatus.Partial;
      } else if (
        this.validDHLEDeclarationStatuses.includes(declarationStatus)
      ) {
        status.isFilled = FillStatus.Complete;
      }
    }
  }
}
