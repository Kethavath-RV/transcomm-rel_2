import { CheckPointFile } from './checkPointFile';
import { ConfirmReturnDelivery } from './confirmReturnDelivery';
import { Movement } from './movements';
import { Order, ReturnRequest } from './order';
import { Direction } from './valueEnums';
import { DeliveredView } from './viewModels';

export interface UpdateTransportInfoDatagenParameters {
  order: Order;
  pickupFile: CheckPointFile;
  direction: Direction;
  movementData: Movement;
  returnRequest?: ReturnRequest;
}

export interface InitiateDeclarationDatagenParameters {
  order: Order;
  direction: Direction;
  invoiceNumber: string;
}

export interface DeliverOrderDatagenParameters {
  order: Order;
  delivered: DeliveredView[];
  direction: Direction;
  pickupFile: CheckPointFile;
  returnRequest?: ReturnRequest;
}

export interface ConfirmReturnDeliveryDatagenParameters {
  order: Order;
  confirmReturnDelivery: ConfirmReturnDelivery;
}

export interface UpdateExitConfirmationDatagenParameters {
  order: Order;
  movementData: Movement;
  pickupFile: CheckPointFile;
  declarationNumber: string;
}

export interface SecretsResponse {
  success: boolean;
  message: string;
}
