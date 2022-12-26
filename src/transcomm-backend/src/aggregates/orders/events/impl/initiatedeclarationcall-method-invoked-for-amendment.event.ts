import { StorableEvent } from 'event-sourcing';

export class InitiateDeclarationCallMethodInvokedForAmendmentEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly invoiceNumber: string,
    public readonly message: string,
    public readonly error: string,
    public readonly retriedBy: string | null,
    public readonly remark: string | null

  ) {
    super();
  }
}
