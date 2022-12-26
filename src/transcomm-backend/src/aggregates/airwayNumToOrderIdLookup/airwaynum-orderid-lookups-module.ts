import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventSourcingModule } from 'event-sourcing';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';

@Module({
  imports: [CqrsModule, EventSourcingModule.forFeature()],
  providers: [...CommandHandlers, ...EventHandlers],
})
export class AirwayNumToOrderIdLookupsModule {}
