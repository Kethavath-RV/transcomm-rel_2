import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ServicelayerModule } from '../servicelayer/servicelayer.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ServicelayerModule,
    BullModule.registerQueue({
      name: 'resubscribeIfUpQueue',
    }),
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
