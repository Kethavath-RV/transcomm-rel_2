import { OrderView } from 'core';
import { AddressDto } from './address.dto';
import { ChainEventDto } from './chainevent.dto';
import { DeclarationDto } from './declaration.dto';
import { DeliveredDto } from './delivered.dto';
import { HouseBillDto } from './houseBill.dto';
import { InvoiceDto } from './invoice.dto';
import { MovementDto } from './movement.dto';

export class OrderDto implements OrderView {
  orderNumber: string;
  orderDate: Date | null;
  lastActionDate: Date | null
  ecomBusinessCode: string | null;
  status: string;
  addresses: AddressDto[];
  invoices: InvoiceDto[];
  eventChain: ChainEventDto[];
  houseBills: HouseBillDto[];
  movements: MovementDto[];
  declarations: DeclarationDto[];
  delivered: DeliveredDto[];
  lockedBy?: string;
}
