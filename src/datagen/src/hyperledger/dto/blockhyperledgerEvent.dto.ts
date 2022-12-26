import { BlockHyperledgerEventFromBlockChain } from 'core';

export class BlockHyperledgerEventDto implements BlockHyperledgerEventFromBlockChain {
  txId: string;
  blockNumber: string;
  eventName?: string;
  chainCodeId: string;
  payload: string;
  privateData?: boolean;
  function?: string;
  namespace?: string;
  collectionName?: string;
}
