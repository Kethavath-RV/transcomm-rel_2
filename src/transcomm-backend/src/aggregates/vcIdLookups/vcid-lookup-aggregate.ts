import { AggregateRoot } from '@nestjs/cqrs';
import { LookupType } from 'core';
import { IncomingErrorProcessedEvent } from './events/impl/incoming-error-processed.event';
import { IncomingErrorReceivedEvent } from './events/impl/incoming-error-received.event';
import { IncomingOrderProcessedEvent } from './events/impl/incoming-order-processed.event';
import { IncomingOrderReceivedEvent } from './events/impl/incoming-order-received.event';

export class VcIdLookupAggregate extends AggregateRoot {
  id: string; // Corresponds to the VC
  orderId: string;
  ecomCode: string;
  invoiceNumber?: string;
  lookupType: LookupType;
  isProcessed = false;

  //Below are only applicable if the lookup is for an error
  commandName?: string;
  errorCode?: string;
  errorMessage?: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  public createVcIdLookupForOrder(
    orderId: string,
    ecomCode: string,
    lookupType: LookupType,
    invoiceNumber?: string,
  ): void {
    this.apply(
      new IncomingOrderReceivedEvent(
        this.id,
        orderId,
        ecomCode,
        lookupType,
        invoiceNumber,
      ),
    );
  }

  public createVcIdLookupForError(
    lookupType: LookupType,
    orderId: string,
    ecomCode: string,
    invoiceNumber?: string,
    commandName?: string,
    errorCode?: string,
    errorMessage?: string,
  ): void {
    this.apply(
      new IncomingErrorReceivedEvent(
        this.id,
        orderId,
        ecomCode,
        lookupType,
        invoiceNumber,
        commandName,
        errorCode,
        errorMessage
      ),
    );
  }

  public toggleOrderIsProcessed(): void {
    this.apply(
      new IncomingOrderProcessedEvent(
        this.id,
        this.orderId,
        this.ecomCode,
        this.lookupType,
      ),
    );
  }

  public toggleErrorIsProcessed(): void {
    this.apply(
      new IncomingErrorProcessedEvent(
        this.id,
        this.orderId,
        this.ecomCode,
        this.lookupType,
      ),
    );
  }


  private onIncomingOrderReceivedEvent(
    createOrderReceivedEvent: IncomingOrderReceivedEvent,
  ) {
    this.orderId = createOrderReceivedEvent.orderId;
    this.ecomCode = createOrderReceivedEvent.ecomCode;
    this.invoiceNumber = createOrderReceivedEvent.invoiceNumber;
    this.lookupType = createOrderReceivedEvent.lookupType;
  }

  private onIncomingErrorReceivedEvent(
    incomingErrorReceivedEvent: IncomingErrorReceivedEvent,
  ) {
    this.orderId = incomingErrorReceivedEvent.orderId;
    this.ecomCode = incomingErrorReceivedEvent.ecomCode;
    this.invoiceNumber = incomingErrorReceivedEvent.invoiceNumber;
    this.commandName = incomingErrorReceivedEvent.commandName;
    this.errorCode = incomingErrorReceivedEvent.errorCode;
    this.errorMessage = incomingErrorReceivedEvent.errorMessage;
    this.lookupType = incomingErrorReceivedEvent.lookupType;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onIncomingOrderProcessedEvent(
    createOrderProcessedEvent: IncomingOrderProcessedEvent,
  ) {
    this.isProcessed = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onIncomingErrorProcessedEvent(
    incomingErrorProcessedEvent: IncomingErrorProcessedEvent,
  ) {
    this.isProcessed = true;
  }
}
