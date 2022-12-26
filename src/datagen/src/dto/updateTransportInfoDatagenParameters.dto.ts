import {
  Direction,
  Movement,
  ReturnRequest,
  UpdateTransportInfoDatagenParameters,
} from 'core';
import { CheckPointFileDto } from './checkpointFile.dto';
import { OrderDto } from './order.dto';

export class UpdateTransportInfoDatagenParametersDto
  implements UpdateTransportInfoDatagenParameters
{
  order: OrderDto;
  pickupFile: CheckPointFileDto;
  direction: Direction;
  movementData: Movement;
  returnRequest?: ReturnRequest;
}
