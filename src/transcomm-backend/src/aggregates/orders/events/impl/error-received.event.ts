import { StorableEvent } from '../../../../event-sourcing';

export class ErrorReceivedEvent extends StorableEvent {
  aggregateEvent = 'order';
  constructor(
    public readonly aggregateId: string,
    public readonly commandName: string,
    public readonly errorCode: string,
    public readonly errorMessage: string,
    public readonly errorTime: Date | string,
    public readonly isFromException?: boolean,
    public readonly vcId?: string
  ) {
    super();
  }
}
