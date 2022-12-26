import { Injectable } from '@nestjs/common';
import {
  EventKeyOrderLookup,
  HyperledgerEvent,
  Prisma,
  TxnLookup,
} from '@prisma/client';
import { DatabaseService } from './database.service';
import { HighestBlockQuery, StartingBlockQuery } from 'core';

@Injectable()
export class HyperledgerEventsService {
  constructor(private prisma: DatabaseService) {}

  async hyperledgerEvent(
    orderUniqueInput: Prisma.HyperledgerEventWhereUniqueInput,
  ): Promise<HyperledgerEvent | null> {
    return this.prisma.hyperledgerEvent.findUnique({
      where: orderUniqueInput,
    });
  }

  highestBlock(): Promise<HighestBlockQuery[]> {
    const nameof = <T>(name: keyof T) => name;
    const blockNumber = nameof<HyperledgerEvent>('blockNumber');

    const query = `SELECT MAX(${blockNumber}) AS 'highestBlockNumber' FROM HyperledgerEvent;`;
    return this.prisma.$queryRaw<HighestBlockQuery[]>(`${query}`);
  }

  /**
   * To ensure we subscribe to events correctly, we start at the second highest known block.
   * This is due to the fact that different types of events (e.g. Chain and Declaration) can take place within the same block number and we want to avoid missing events.
   * This query finds the highest block per event type (chainCode/declaration/claim)
   * then performs a sub query without that value
   * leaving the max equalling the second highest value per event.
   *
   * @returns {Promise<StartingBlockQuery[]>} the result of the query
   * @example [{"eventName": "Chain", "highestBlock": 4}, {"eventName": "Declaration", "highestBlock": 2}]
   * @module database
   */
  findStartingBlock(): Promise<StartingBlockQuery[]> {
    const nameof = <T>(name: keyof T) => name;
    const blockNumber = nameof<HyperledgerEvent>('blockNumber');
    const eventName = nameof<HyperledgerEvent>('eventName');
    const query = `SELECT a1.${eventName}, MAX(${blockNumber}) AS 'highestBlockNumber'
      FROM
      (
        SELECT ${eventName}, MAX(${blockNumber}) AS 'highestBlockNumber'
        FROM HyperledgerEvent AS a
        GROUP BY ${eventName}
      ) a1
      JOIN HyperledgerEvent AS b
      ON b.${eventName} = a1.${eventName}
      AND b.${blockNumber} != a1.highestBlockNumber
      GROUP BY a1.${eventName}`;
    return this.prisma.$queryRaw<StartingBlockQuery[]>(`${query}`);
  }

  async createHyperledgerEvent(
    data: Prisma.HyperledgerEventCreateInput,
  ): Promise<HyperledgerEvent> {
    return this.prisma.hyperledgerEvent.create({
      data,
    });
  }

  async performEventKeyLookup(
    key: string,
    collection: string,
  ): Promise<EventKeyOrderLookup | null> {
    return this.prisma.eventKeyOrderLookup.findUnique({
      where: {
        key_collection: {
          key: key,
          collection: collection,
        },
      },
    });
  }

  async getHyperledgerEventByKey(
    key: string,
  ): Promise<HyperledgerEvent | null> {
    return this.prisma.hyperledgerEvent.findFirst({
      where: {
        key: key,
      },
    });
  }

  /**
   *
   * Verify if a hyperledger event exists prior to creating a new one.
   *
   * @param txId events transaction Id
   * @param blockNumber events block number
   * @param eventName? event name
   * @returns {Promise<boolean>} true if any record exists with the given txId and blocknumber
   * @example true
   * @module database
   */
  async checkRecordExists(
    txId: string,
    blockNumber: number,
    eventName?: string,
  ): Promise<boolean> {
    const result = await this.prisma.hyperledgerEvent.count({
      where: {
        txId: txId,
        blockNumber: blockNumber,
        eventName: eventName,
      },
    });
    return result > 0;
  }

  async updateHyperledgerEvent(
    data: Prisma.HyperledgerEventUpdateArgs,
  ): Promise<HyperledgerEvent> {
    return this.prisma.hyperledgerEvent.update(data);
  }

  async createEventKeyLookup(
    data: Prisma.EventKeyOrderLookupUpsertArgs,
  ): Promise<EventKeyOrderLookup> {
    return this.prisma.eventKeyOrderLookup.upsert(data);
  }

  async createTxnLookup(data: Prisma.TxnLookupCreateInput): Promise<TxnLookup> {
    return this.prisma.txnLookup.create({
      data,
    });
  }

  async getTxnId(id: string): Promise<TxnLookup | null> {
    return this.prisma.txnLookup.findUnique({
      where: {
        txnId: id,
      },
    });
  }
}
