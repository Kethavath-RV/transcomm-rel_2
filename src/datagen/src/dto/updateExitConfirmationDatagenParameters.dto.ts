import { Movement, UpdateExitConfirmationDatagenParameters } from 'core';
import { CheckPointFileDto } from './checkpointFile.dto';
import { OrderDto } from './order.dto';

export class UpdateExitConfirmationDatagenParametersDto
  implements UpdateExitConfirmationDatagenParameters
{
  order: OrderDto;
  movementData: Movement;
  pickupFile: CheckPointFileDto;
  declarationNumber: string;
}
