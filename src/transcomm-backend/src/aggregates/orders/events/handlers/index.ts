import { IncomingDeclarationRequestEventHandler } from '../../../airwayNumToOrderIdLookup/events/handlers/incoming-declaration-request.handler';
import { AmendmentCreatedEventHandler } from './amendment-created.handler';
import { ClaimDocumentTrackingDataProcessedEventHandler } from './claim-documenttrackingdata-processed.handler';
import { ClaimRequestDataProcessedEventHandler } from './claimrequestdata-processed.handler';
import { ConfirmReturnDeliveryMessageReceivedEventHandler } from './confirm-return-delivery-message-received.handler';
import { ConfirmReturnDeliveryMethodInvokedEventHandler } from './confirmreturndelivery-method-invoked.handler';
import { DeclarationDocumentTrackingDataProcessedEventHandler } from './declaration-documenttrackingdata-processed.handler';
import { DeclarationRequestReceivedEventHandler } from './declaration-request-received.handler';
import { DeclarationJsonMappingDataProcessedEventHandler } from './declarationjsonmappingdata-processed.handler';
import { DeliveredHandler } from './delivered.handler';
import { DeliverOrderMethodInvokedEventHandler } from './deliverorder-method-invoked.handler';
import { DetailMovementReceivedHandler } from './detail-movement-received.handler';
import { DfCheckpointFileReceivedHandler } from './df-checkpointfile-received.handler';
import { ErrorReceivedEventHandler } from './error-received.handler';
import { InitiateDeclarationCallMethodInvokedForAmendmentHandler } from './initiatedeclarationcall-method-invoked-for-amendment.handler';
import { InitiateDeclarationCallMethodInvokedHandler } from './initiatedeclarationcall-method-invoked.handler';
import { InvoiceDataProcessedEventHandler } from './invoicedata-processed.handler';
import { InvokeHyperledgerFailedEventHandler } from './invokehyperledger-failed.handler';
import { MasterMovementFileReceivedHandler } from './master-movementfile-received.handler';
import { NotificationProcessedHandler } from './notification-processed.handler';
import { OrderCancelledHandler } from './order-cancelled.handler';
import { OrderCreatedHandler } from './order-created.handler';
import { OrderLockedEventHandler } from './order-locked.handler';
import { OrderReturnedHandler } from './order-returned.handler';
import { OrderUnlockedEventHandler } from './order-unlocked.handler';
import { OrderUpdatedHandler } from './order-updated.handler';
import { OrderDataProcessedEventEventHandler } from './orderdata-processed.handler';
import { OtherCheckpointFileReceivedHandler } from './other-checkpointfile-received.handler';
import { PickupFileReceivedHandler } from './pickupfile-received.handler';
import { ReturnDeliverOrderMethodInvokedHandler } from './return-deliverorder-method-invoked.handler';
import { ReturnUpdateTransportInfoMethodInvokedHandler } from './return-updatetransportinfo-method-invoked.handler';
import { SubmitOrderMethodInvokedForAmendmentEventHandler } from './submitorder-method-invoked-for-amendment.handler';
import { SubmitOrderMethodInvokedHandler } from './submitorder-method-invoked.handler';
import { SubmitOrderModeFinalMethodInvokedHandler } from './submitordermodefinal-method-invoked.handler';
import { SubmitReturnOrderMethodInvokedHandler } from './submitreturnorder-method-invoked.handler';
import { UndeliveredHandler } from './undelivered.handler';
import { UpdateExitConfirmationMethodInvokedEventHandler } from './updateexitconfirmation-method-invoked.handler';
import { UpdateTransportInfoMethodInvokedForAmendmentHandler } from './updatetransportinfo-method-invoked-for-amendment.handler';
import { UpdateTransportInfoMethodInvokedHandler } from './updatetransportinfo-method-invoked.handler';

export const EventHandlers = [
  OrderCreatedHandler,
  OrderUpdatedHandler,
  AmendmentCreatedEventHandler,
  PickupFileReceivedHandler,
  DfCheckpointFileReceivedHandler,
  SubmitOrderMethodInvokedHandler,
  NotificationProcessedHandler,
  MasterMovementFileReceivedHandler,
  DetailMovementReceivedHandler,
  UpdateTransportInfoMethodInvokedHandler,
  InitiateDeclarationCallMethodInvokedHandler,
  DeclarationDocumentTrackingDataProcessedEventHandler,
  ClaimDocumentTrackingDataProcessedEventHandler,
  OrderLockedEventHandler,
  OrderUnlockedEventHandler,
  DetailMovementReceivedHandler,
  UpdateTransportInfoMethodInvokedHandler,
  InitiateDeclarationCallMethodInvokedHandler,
  ClaimRequestDataProcessedEventHandler,
  DeclarationJsonMappingDataProcessedEventHandler,
  SubmitOrderMethodInvokedForAmendmentEventHandler,
  UpdateTransportInfoMethodInvokedForAmendmentHandler,
  DeliveredHandler,
  UndeliveredHandler,
  OrderCancelledHandler,
  OrderReturnedHandler,
  ConfirmReturnDeliveryMethodInvokedEventHandler,
  ConfirmReturnDeliveryMessageReceivedEventHandler,
  UpdateExitConfirmationMethodInvokedEventHandler,
  DeliverOrderMethodInvokedEventHandler,
  InvokeHyperledgerFailedEventHandler,
  ErrorReceivedEventHandler,
  SubmitOrderModeFinalMethodInvokedHandler,
  OrderDataProcessedEventEventHandler,
  InvoiceDataProcessedEventHandler,
  SubmitReturnOrderMethodInvokedHandler,
  ReturnUpdateTransportInfoMethodInvokedHandler,
  ReturnDeliverOrderMethodInvokedHandler,
  InitiateDeclarationCallMethodInvokedForAmendmentHandler,
  OtherCheckpointFileReceivedHandler,
  IncomingDeclarationRequestEventHandler,
  DeclarationRequestReceivedEventHandler,
];
