import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { HyperledgerModule } from '../hyperledger/hyperledger.module';
import { DataqueryQueueProcessorService } from './dataqueryqueueprocessor.service';
import { ResubscribeIfUpQueueProcessorService } from './resubscribeifupqueueprocessor.service';
import { BullModule } from '@nestjs/bull';
import { ServicelayerModule } from '../servicelayer/servicelayer.module';
import { BlessModule } from 'bless/bless.module';
import { HlEventProcessorService } from './hl-event-processor/hl-event-processor.service';

@Module({
  imports: [
    HyperledgerModule,
    DatabaseModule,
    BlessModule,
    ConfigModule,
    ServicelayerModule,
    BullModule.registerQueue({
      name: 'resubscribeIfUpQueue',
    }),
  ],
  providers: [
    DataqueryQueueProcessorService,
    ResubscribeIfUpQueueProcessorService,
    HlEventProcessorService,
  ],
  exports: [
    DataqueryQueueProcessorService,
    ResubscribeIfUpQueueProcessorService,
  ],
})
export class QueueprocessorModule {}
