import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { BlessClientService } from 'bless/bless-client/bless-client.service';
import { Job } from 'bull';
import {
  DocumentTrackingData,
  HyperledgerQueryResponse,
  HyperledgerQueryWithTxID,
  InvoiceData,
  KafkaMessageSetup,
} from 'core';
import { HyperledgerEventsService } from '../database/hyperledger-events.service';
import { HyperledgerClientService } from '../hyperledger/hyperledger-client/hyperledger-client.service';

@Injectable()
@Processor('dataqueryQueue')
export class DataqueryQueueProcessorService {
  private logger = new Logger(this.constructor.name);

  constructor(
    readonly hlclient: HyperledgerClientService,
    readonly hlEventService: HyperledgerEventsService,
    private blessClient: BlessClientService,
  ) { }

  @Process('dataquery')
  async handleDataquery(job: Job<HyperledgerQueryWithTxID>): Promise<void> {
    this.logger.log(`starting hyperledgerQueryJob: ${job.id}`);
    this.logger.debug(`job payload: ${JSON.stringify(job)}`);

    let response: HyperledgerQueryResponse;
    try {
      response = await this.hlclient.queryOrderData(
        "GetDataByKey",
        job.data.key,
        job.data.collection,
      );
    } catch (error) {
      this.logger.error('error on processing dataquery' + error);
      throw error;
    }

    //If query is succesfull, set to processed in db, send to kafka
    if (response.message.data) {
      try {
        const id = (
          await this.hlEventService.getHyperledgerEventByKey(job.data.key)
        )?.id;
        if (!id)
          throw Error("Hyperledger Event not found in Database with key: " + job.data.key)
        await this.hlEventService.updateHyperledgerEvent({
          where: { id },
          data: { status: EventStatus.PROCESSING },
        });
      } catch (error) {
        this.logger.error('Failed to store hyperLedgerEvent: ' + error);
        throw error;
      }

      this.logger.debug(
        'Response HL data:' +
        JSON.stringify(response.message.data),
      );

      let invoiceNumber = job.data.invoiceNumber;

      if (job.data.collection === 'documenttracking') {
        const documentTrackingData: DocumentTrackingData =
          response.message.data;
        invoiceNumber = documentTrackingData.invoiceNo;
      }

      if (job.data.collection === 'invoice_data') {
        const invoiceData: InvoiceData =
          response.message.data;
        invoiceNumber = invoiceData?.current?.invoiceNumber ?? job.data.invoiceNumber;
      }

      try {
        const kafkaModel: KafkaMessageSetup = {
          orderNumber: job.data.orderNumber,
          invoiceNumber: invoiceNumber,
          ecomBusinessCode: job.data.ecomCode,
          authorizationId: job.data.ecomCode,
          eventType: job.data.collection,
          data: response.message.data,
          txnId: job.data.txId,
        };

        await this.blessClient.post(kafkaModel, job.data.collection?.toUpperCase(), job.data.eventName?.toUpperCase());
      } catch (error) {
        this.logger.error('Failed to publish kafkaMessage: ' + error);
        throw error;
      }
    }
  }
}
