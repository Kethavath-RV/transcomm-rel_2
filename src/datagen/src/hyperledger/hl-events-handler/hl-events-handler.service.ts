import { EventStatus, TxnLookup } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { EventPayload, HyperledgerQueryWithTxID } from 'core';
import { HyperledgerEventsService } from 'database/hyperledger-events.service';
import {
  HyperledgerEventNames,
  HyperledgerEventExists,
} from 'hyperledger/constants/hyperledger-events';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HyperledgerEventsHandlerService {
  constructor(
    @InjectQueue('dataqueryQueue') private readonly dataQueryQueue: Queue,
    private readonly hlEventService: HyperledgerEventsService,
    private readonly configService: ConfigService,
  ) {}

  private logger = new Logger(this.constructor.name);

  private eventToHandle = (eventName: string) =>
    [
      'order_data',
      'documenttracking',
      'declaration_json_mapping',
      'claim_request',
      'invoice_data',
    ].includes(eventName);

  ///Handle for declarations and claim status change
  async contractStatusChange(
    eventName: string,
    payloadEvents: EventPayload[],
    requestTxId: string,
    blockNumber: string,
  ): Promise<void> {
    if (await this.recordExists(requestTxId, blockNumber)) return;
    if (!HyperledgerEventExists(eventName))
      throw new Error(`Event not known ${eventName}`);
    let processed = false;
    for (const hlEvent of payloadEvents) {
      const lookup = await this.hlEventService.performEventKeyLookup(
        hlEvent.Key,
        hlEvent.Collection,
      );
      if (!lookup) {
        this.logger.warn(
          `key: ${hlEvent.Key} and collection: ${hlEvent.Collection} were not found`,
        );
        continue;
      }

      await this.createQueueRecord(
        hlEvent,
        lookup.orderNumber,
        lookup.ecomCode,
        blockNumber,
        eventName,
        requestTxId,
      );
      await this.queueQuery(
        hlEvent,
        requestTxId,
        eventName,
        lookup.orderNumber,
        lookup.ecomCode,
        lookup.invoiceNumber ?? '',
      );

      processed = true;
      this.logger.log(
        `key: ${hlEvent.Key} and collection: ${hlEvent.Collection} were found and have been queued`,
      );
    }
    if (processed === false) {
      await this.createIgnoredQueueRecord(blockNumber, eventName, requestTxId);
    }
  }

  async chainCodeEventHandler(
    eventName: string,
    payloadEvents: EventPayload[],
    txId: string,
    blockNumber: string,
  ): Promise<boolean> {
    if (await this.recordExists(txId, blockNumber)) return false;

    const promisesToAwait: Promise<unknown>[] = [];
    const promisesToHappenFirst: Promise<unknown>[] = [];
    const attempts = this.configService.get('HL_QUEUE_RETRY_ATTEMPTS') ?? 3;
    const backOff = this.configService.get('HL_QUEUE_RETRY_DELAY') ?? 1000;
    let txnLookup: TxnLookup | null = null;
    let retry = 0;
    do {
      txnLookup = await this.hlEventService.getTxnId(txId);
      if (txnLookup === null) {
        this.logger.warn(`TxId not found ${txId}`);
        ++retry;
        this.logger.log(retry);
        await new Promise((res) => setTimeout(res, backOff));
      }
    } while (txnLookup === null && retry < attempts);

    if (txnLookup === null) {
      await this.createIgnoredQueueRecord(
        blockNumber,
        HyperledgerEventNames.chain,
        txId,
      );
      return false;
    }
    const { orderNumber, ecomCode, invoiceNumber, txnId } = txnLookup;

    for (const hlEvent of payloadEvents) {
      if (!this.eventToHandle(hlEvent.Collection)) continue;

      this.logger.log(
        `Received HL event ${hlEvent.Collection} for txId: ${txnLookup.txnId}, storing event and key.`,
      );
      // -Create Queue record and key lookup
      promisesToHappenFirst.push(
        this.createQueueRecord(
          hlEvent,
          orderNumber,
          ecomCode,
          blockNumber,
          HyperledgerEventNames.chain,
          txId,
        ),
      );
      promisesToHappenFirst.push(
        this.storeEventKeyLookup(hlEvent, orderNumber, ecomCode, invoiceNumber),
      );
      // - Background task/ add to background queue a task to query the data using the keys in the first event
    }

    await Promise.all(promisesToHappenFirst); //ensure these records are stored first.

    //Queue the queries.
    for (const hlEvent of payloadEvents) {
      if (!this.eventToHandle(hlEvent.Collection)) continue;
      promisesToAwait.push(
        this.queueQuery(
          hlEvent,
          txnId,
          eventName,
          orderNumber,
          ecomCode,
          invoiceNumber,
        ),
      );
    }
    await Promise.all(promisesToAwait);
    return true;
  }

  private createQueueRecord(
    hlEvent: EventPayload,
    orderNumber: string,
    ecomCode: string,
    blockNumber: string,
    eventName: string,
    txId: string,
  ) {
    return this.hlEventService.createHyperledgerEvent({
      status: EventStatus.OPEN,
      key: hlEvent.Key,
      collection: hlEvent.Collection,
      blockNumber: isNaN(Number(blockNumber)) ? 0 : Number(blockNumber),
      orderNumber: orderNumber,
      ecomCode: ecomCode,
      eventName: eventName,
      txId: txId,
    });
  }

  private createIgnoredQueueRecord(
    blockNumber: string,
    eventName: string,
    txId: string,
  ) {
    return this.hlEventService.createHyperledgerEvent({
      status: EventStatus.IGNORE,
      key: '',
      collection: '',
      blockNumber: isNaN(Number(blockNumber)) ? 0 : Number(blockNumber),
      orderNumber: '',
      ecomCode: '',
      eventName: eventName,
      txId: txId,
    });
  }

  private storeEventKeyLookup(
    hlEvent: EventPayload,
    orderNumber: string,
    ecomCode: string,
    invoiceNumber: string | null,
  ) {
    return this.hlEventService.createEventKeyLookup({
      create: {
        key: hlEvent.Key,
        collection: hlEvent.Collection,
        orderNumber: orderNumber,
        invoiceNumber: invoiceNumber ?? '',
        ecomCode: ecomCode,
      },
      update: {
        key: hlEvent.Key,
        collection: hlEvent.Collection,
        orderNumber: orderNumber,
        invoiceNumber: invoiceNumber ?? '',
        ecomCode: ecomCode,
      },
      where: {
        key_collection: {
          key: hlEvent.Key,
          collection: hlEvent.Collection,
        },
      },
    });
  }

  private queueQuery(
    hlEvent: EventPayload,
    txId: string,
    eventName: string,
    orderNumber: string,
    ecomCode: string,
    invoiceNumber: string | null,
  ) {
    const query: HyperledgerQueryWithTxID = {
      key: hlEvent.Key,
      collection: hlEvent.Collection,
      txId: txId,
      eventName: eventName,
      orderNumber: orderNumber,
      invoiceNumber: invoiceNumber ?? '',
      ecomCode: ecomCode,
    };

    const jobOptions = {
      removeOnComplete: true,
    };

    return this.dataQueryQueue.add('dataquery', query, jobOptions);
  }

  private async recordExists(
    txId: string,
    blockNumber: string,
  ): Promise<boolean> {
    const result = await this.hlEventService.checkRecordExists(
      txId,
      Number(blockNumber),
    );
    if (result)
      this.logger.warn(
        `Record found for this event, with txId ${txId} and blockNumber ${blockNumber}`,
      );
    return result;
  }
}
