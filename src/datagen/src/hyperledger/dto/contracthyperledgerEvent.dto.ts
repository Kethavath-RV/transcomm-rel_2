import { ContractHyperledgerEventFromBlockChain } from 'core';

export class ContractHyperledgerEventDto implements ContractHyperledgerEventFromBlockChain {
  txId: string;
  block: string;
  eventName?: string;
  chainCodeId: string;
  payload: string;
  privateData?: boolean;
  function?: string;
  namespace?: string;
  collectionName?: string;
}
