import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { ServicelayerService } from '../servicelayer/servicelayer.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    @InjectQueue('resubscribeIfUpQueue')
    private readonly resubscribeIfUpQueue: Queue,
    private readonly servicelayerService: ServicelayerService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async pingHyperledger(): Promise<void> {
    this.logger.log(
      'Pinging hyperledgerclient and adding resubscribing job to queue if needed. Also checking hyperledger subscriptions and ajdusting if there is a mismatch. (Happens every 5 minutes)',
    );
    try {
      if ((await this.resubscribeIfUpQueue.count()) === 0) {
        //This will throw an error if the service is not up
        await this.servicelayerService.pingHL();
        await this.servicelayerService.checkHLSubscriptions();
      } else {
        this.logger.log(
          'ResubscribeIfUp job already in queue, not pinging/adding a new job',
        );
      }
    } catch (error) {
      this.resubscribeIfUpQueue.add('resubscribeIfUp', {}, { delay: 60000 });
    }
  }
}
