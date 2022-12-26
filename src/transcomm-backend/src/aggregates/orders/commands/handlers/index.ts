import { CancelOrderHandler } from './cancel-order.handler';
import { ConfirmReturnDeliveryMessageReceivedCommandHandler } from './confirm-return-delivery-message.handler';
import { CreateAmendmentFromDeclarationRequestCommandHandler } from './create-amendment-declaration-request.handler';
import { CreateAmendmentCommandHandler } from './create-amendment.handler';
import { CreateOrderHandler } from './create-order.handler';
import { InvokeCancelOrderMethodCommandHandler } from './invoke-cancelorder-method.handler';
import { InvokeConfirmReturnDeliveryMethodCommandHandler } from './invoke-confirmreturndelivery-method.handler';
import { InvokeDeliverOrderMethodCommandHandler } from './invoke-deliverorder-method.handler';
import { InvokeInitiateDeclarationCallMethodForAmendmentCommandHandler } from './invoke-initiatedeclarationcall-method-for-amendment.handler';
import { InvokeInitiateDeclarationCallMethodCommandHandler } from './invoke-initiatedeclarationcall-method.handler';
import { InvokeReturnDeliverOrderMethodCommandHandler } from './invoke-return-deliverorder-method.handler';
import { InvokeReturnUpdateTransportInfoMethodHandler } from './invoke-return-updatetransportinfo-method.handler';
import { InvokeReturnOrderMethodHandler } from './invoke-returnorder-method.handler';
import { InvokeSubmitOrderMethodForAmendmentCommandHandler } from './invoke-submitorder-method-for-amendment.handler';
import { InvokeSubmitOrderMethodHandler } from './invoke-submitorder-method.handler';
import { InvokeSubmitOrderModeFinalMethodHandler } from './invoke-submitordermodefinal.handler';
import { InvokeUpdateExitConfirmationCommandHandler } from './invoke-updateexitconfirmation-method.handler';
import { InvokeUpdateOrderMethodCommandHandler } from './invoke-updateorder-method.handler';
import { InvokeUpdateTransportInfoMethodForAmendmentCommandHandler } from './invoke-updatetransportinfo-method-for-amendment.handler';
import { InvokeUpdateTransportInfoMethodHandler } from './invoke-updatetransportinfo-method.handler';
import { LockOrderCommandHandler } from './lock-order.handler';
import { ProcessDeclarationRequestCommandHandler } from './process-declaration-request.handler';
import { ProcessDeliveredHandler } from './process-delivered.handler';
import { ProcessDetailMovementHandler } from './process-detail-movementfile.handler';
import { ProcessDfCheckpointFileHandler } from './process-df-checkpointfile.handler';
import { ProcessHyperledgerEventHandler } from './process-hl-event.handler';
import { ProcessMasterMovementFileHandler } from './process-master-movementfile.handler';
import { ProcessNotificationHandler } from './process-notification.handler';
import { ProcessOtherCheckpointFileHandler } from './process-other-checkpointfile.handler';
import { ProcessPickupFileHandler } from './process-pickupfile.handler';
import { ProcessUndeliveredHandler } from './process-undelivered.handler';
import { RetryHyperledgerHandler } from './retry-hyperledger.handler';
import { SubmitReturnOrderHandler } from './submit-return-order.handler';
import { UnlockOrderCommandHandler } from './unlock-order.handler';
import { UpdateOrderHandler } from './update-order.handler';
import { SendDHLEDeclarationResponseHandler } from './send-dhle-declaration-response-command.handler';

export const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderHandler,
  SubmitReturnOrderHandler,
  CreateAmendmentCommandHandler,
  ProcessPickupFileHandler,
  ProcessDfCheckpointFileHandler,
  ProcessNotificationHandler,
  InvokeSubmitOrderMethodHandler,
  ProcessMasterMovementFileHandler,
  ProcessDetailMovementHandler,
  InvokeUpdateTransportInfoMethodHandler,
  InvokeInitiateDeclarationCallMethodCommandHandler,
  ProcessHyperledgerEventHandler,
  LockOrderCommandHandler,
  UnlockOrderCommandHandler,
  InvokeSubmitOrderMethodForAmendmentCommandHandler,
  InvokeUpdateTransportInfoMethodForAmendmentCommandHandler,
  ProcessDeliveredHandler,
  ProcessUndeliveredHandler,
  CancelOrderHandler,
  ConfirmReturnDeliveryMessageReceivedCommandHandler,
  InvokeConfirmReturnDeliveryMethodCommandHandler,
  InvokeUpdateExitConfirmationCommandHandler,
  InvokeSubmitOrderModeFinalMethodHandler,
  RetryHyperledgerHandler,
  InvokeReturnOrderMethodHandler,
  InvokeDeliverOrderMethodCommandHandler,
  InvokeReturnUpdateTransportInfoMethodHandler,
  InvokeReturnDeliverOrderMethodCommandHandler,
  InvokeInitiateDeclarationCallMethodForAmendmentCommandHandler,
  InvokeCancelOrderMethodCommandHandler,
  InvokeUpdateOrderMethodCommandHandler,
  ProcessOtherCheckpointFileHandler,
  ProcessDeclarationRequestCommandHandler,
  CreateAmendmentFromDeclarationRequestCommandHandler,
  SendDHLEDeclarationResponseHandler,
];
