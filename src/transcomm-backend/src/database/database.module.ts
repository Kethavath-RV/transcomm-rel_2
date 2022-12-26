import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressService } from './address.service';
import { DatabaseService } from './database.service';
import { HouseBillService } from './houseBill.service';
import { OrderService } from './order.service';
import { TokenService } from './token/token.service';

@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    AddressService,
    OrderService,
    HouseBillService,
    TokenService,
  ],
  exports: [
    DatabaseService,
    AddressService,
    OrderService,
    HouseBillService,
    TokenService,
  ],
})
export class DatabaseModule {}
