import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries/handlers';
import { CqrsModule } from '@nestjs/cqrs';
import { EventSourcingModule } from 'event-sourcing';
import { DatabaseModule } from '../../database/database.module';
import { ProducerModule } from '../../kafka/producer/producer.module';
import { ConfigModule } from '@nestjs/config';
import { DatagenClientModule } from '../../datagen-client/datagen-client.module';
import { BlessModule } from 'bless/bless.module';
import { ViewsService } from './views/views.service';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule.forFeature(),
    DatagenClientModule,
    DatabaseModule,
    ProducerModule,
    ConfigModule,
    BlessModule
  ],
  controllers: [OrdersController],
  providers: [...CommandHandlers, ...EventHandlers, ...QueryHandlers, ViewsService],
})
export class OrdersModule {}
