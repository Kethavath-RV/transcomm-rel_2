import { Module } from '@nestjs/common';
import { ServicelayerModule } from '../servicelayer/servicelayer.module';
import { SubscriptionHandlerService } from './subscriptionHandler.service';

@Module({
  imports: [ServicelayerModule],
  providers: [SubscriptionHandlerService],
  exports: [SubscriptionHandlerService],
})
export class SubscriptionHandlerModule {}
