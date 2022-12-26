import {
  ConfirmReturnDelivery,
  ConfirmReturnDeliveryDatagenParameters,
} from 'core';
import { OrderDto } from './order.dto';

export class ConfirmReturnDeliveryDatagenParametersDto
  implements ConfirmReturnDeliveryDatagenParameters
{
  order: OrderDto;
  confirmReturnDelivery: ConfirmReturnDelivery;
}
