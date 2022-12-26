import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProducerModule } from 'kafka/producer/producer.module';
import { BlessClientService } from './bless-client/bless-client.service';

@Module({
  imports: [
    ConfigModule,
    ProducerModule
  ],
  providers: [BlessClientService],
  exports: [BlessClientService]
})
export class BlessModule { }
