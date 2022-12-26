import { ContractMethod, ContractType } from 'core';
import { StorableEvent } from 'event-sourcing';

export class InvokeHyperledgerFailedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly contractType: ContractType,
    public readonly errorCode: string,
    public readonly errorDescription: string,
    public readonly failureDate: Date,
    public readonly contractMethod: ContractMethod,
    public readonly path: string,
    public readonly errorName: string,
    public readonly vcId?: string,
    public readonly errorMessage?: string,
  ) {
    super();
  }
}
