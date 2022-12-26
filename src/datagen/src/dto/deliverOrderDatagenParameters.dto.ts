import {
  DeliveredView,
  DeliverOrderDatagenParameters,
  Direction,
  ReturnRequest,
} from 'core';
import { CheckPointFileDto } from './checkpointFile.dto';
import { OrderDto } from './order.dto';

export class DeliverOrderDatagenParametersDto
  implements DeliverOrderDatagenParameters
{
  order: OrderDto;
  delivered: DeliveredView[];
  direction: Direction;
  pickupFile: CheckPointFileDto;
  returnRequest?: ReturnRequest;
}
