import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { HyperledgerEventsService } from './hyperledger-events.service';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, HyperledgerEventsService],
  exports: [DatabaseService, HyperledgerEventsService],
})
export class DatabaseModule {}
