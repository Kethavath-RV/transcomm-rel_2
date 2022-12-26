import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HyperledgerEventPayload } from 'core';
import { ContractHyperledgerEventDto } from 'hyperledger/dto/contracthyperledgerEvent.dto';
import { HyperledgerEventsHandlerService } from 'hyperledger/hl-events-handler/hl-events-handler.service';

@Injectable()
@Processor('hlEventQueue')
export class HlEventProcessorService {
  private logger = new Logger(this.constructor.name);

  constructor(readonly eventHandler: HyperledgerEventsHandlerService) {}

  private StatusChangeEvents = [
    'DECLARATION_STATUS_CHANGE',
    'CLAIM_STATUS_CHANGE',
  ];

  @Process('processContractEvent')
  async handleContractEvent(
    job: Job<ContractHyperledgerEventDto>,
  ): Promise<void> {
    this.logger.log('starting processContractEvent:' + JSON.stringify(job.id));
    const { data } = job;
    if (!data.payload || data.payload === '') {
      this.logger.warn(
        'JSON payload is empty or null, therefore not processing',
      );
      return;
    }
    const payload: HyperledgerEventPayload = JSON.parse(data.payload);
    this.logger.debug(`block number: ${data.block}`);

    if (!payload.events) {
      this.logger.error(
        `Incoming contract event with empty event list on payload: ${data.payload}`,
      );
      return;
    }

    //If the event name matches a status change, do a key lookup rather than txId lookup.
    try {
      if (this.StatusChangeEvents.includes(payload.eventName)) {
        await this.eventHandler.contractStatusChange(
          payload.eventName,
          payload.events,
          data.txId,
          data.block,
        );
        return;
      }

      //check TxId and process.
      const result = await this.eventHandler.chainCodeEventHandler(
        payload.eventName,
        payload.events,
        data.txId,
        data.block,
      );
      if (!result) {
        this.logger.warn(`skipping job: ${job.id} txId could not be found`);
      }

      this.logger.log(
        'finishing processContractEvent:' + JSON.stringify(job.id),
      );
    } catch (e) {
      await job.queue.pause(); //if the queue isn't paused here the next job starts
      throw e;
    }
  }

  @OnQueueFailed()
  async handleQueueError(job: Job<ContractHyperledgerEventDto>, error: Error) {
    this.logger.log(
      `job: ${job.id} with block ${job.data.block} encountered an issue`,
    );
    this.logger.error(error);
    this.logger.log('clearing the queue and stopping the application');
    await Promise.all([
      job.queue.empty(),
      job.queue.clean(0, 'active'),
      job.queue.clean(0, 'completed'),
      job.queue.clean(0, 'delayed'),
      job.queue.clean(0, 'failed'),
      job.queue.clean(0, 'wait'),
      job.queue.clean(0, 'paused'),
    ]);
    process.exit(0);
  }
}
