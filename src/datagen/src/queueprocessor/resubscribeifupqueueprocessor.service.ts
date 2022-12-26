import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ServicelayerService } from '../servicelayer/servicelayer.service';

@Injectable()
@Processor('resubscribeIfUpQueue')
export class ResubscribeIfUpQueueProcessorService {
  private logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue('resubscribeIfUpQueue')
    private readonly resubscribeIfUpQueue: Queue,
    private readonly servicelayer: ServicelayerService,
  ) { }

  @Process('resubscribeIfUp')
  async handleResubscribeIfUp(job: Job): Promise<void> {
    this.logger.log(`starting resubscribeIfUpJob: ${job.id}`);
    this.logger.debug(`job payload: ${JSON.stringify(job)}`);

    try {
      await this.servicelayer.pingAndResubscribeIfUp();
      this.logger.log('Resubscribe succesful, emptying resubscribe queue');
      Promise.all([
        this.resubscribeIfUpQueue.empty(),
        this.resubscribeIfUpQueue.clean(0, 'delayed'),
        this.resubscribeIfUpQueue.clean(0, 'wait'),
        this.resubscribeIfUpQueue.clean(0, 'active'),
        this.resubscribeIfUpQueue.clean(0, 'completed'),
        this.resubscribeIfUpQueue.clean(0, 'failed'),
      ]);
    } catch {
      let newDelay = job.opts.delay ? job.opts.delay * 2 : 60000;
      if (newDelay > 600000) newDelay = 600000;
      this.resubscribeIfUpQueue.add('resubscribeIfUp', {}, { delay: newDelay });
    }
  }
}
