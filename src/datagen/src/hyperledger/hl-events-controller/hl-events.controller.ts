import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ContractHyperledgerEventDto } from 'hyperledger/dto/contracthyperledgerEvent.dto';
import { InjectQueue } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Controller('hl-events')
export class HyperledgerEventsController {
  constructor(
    @InjectQueue('hlEventQueue') private readonly dataQueryQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  private logger = new Logger(this.constructor.name);

  @Post('contract')
  async processContractHyperledgerEvent(
    @Body() req: ContractHyperledgerEventDto,
  ): Promise<void> {
    this.logger.log(`Received Contract HL Event`);
    this.logger.debug(`Contract HL Event Payload: ${JSON.stringify(req)}`);
    this.dataQueryQueue.add('processContractEvent', req, this.jobOptions());
  }

  private jobOptions(): Bull.JobOptions {
    return {
      removeOnComplete: true,
      removeOnFail: true,
    };
  }
}
