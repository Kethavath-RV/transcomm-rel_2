import { Direction, InitiateDeclarationDatagenParameters } from 'core';
import { OrderDto } from './order.dto';

export class InitiateDeclarationDatagenParametersDto
  implements InitiateDeclarationDatagenParameters
{
  order: OrderDto;
  direction: Direction;
  invoiceNumber: string;
}
