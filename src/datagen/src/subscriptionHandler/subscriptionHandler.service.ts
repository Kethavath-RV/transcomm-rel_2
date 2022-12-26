import { Injectable } from '@nestjs/common';
import { ServicelayerService } from '../servicelayer/servicelayer.service';

@Injectable()
export class SubscriptionHandlerService {
  constructor(private servicelayerService: ServicelayerService) {}

  //called from main.ts to ensure it happens after controllers are ready.
  async createSubscriptions(): Promise<void> {
    await this.servicelayerService.initialiseSubscriptions();
  }

  async onModuleDestroy(): Promise<void> {
    await this.servicelayerService.unsubscribeFromAllCurrentEvents();
  }
}
