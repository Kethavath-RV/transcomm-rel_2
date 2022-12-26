import { AggregateRoot } from '@nestjs/cqrs';
import { DetailMovement } from 'core';
import { IncomingDetailMovementFileEvent } from './events/impl/incoming-detail-movement-file.event';
import { MawbToAirwayNumsLookupCreatedEvent } from './events/impl/mawb-to-airwaynums-lookup-created.event';

export class MawbToAirwayNumsLookupAggregate extends AggregateRoot {
  mawb: string;
  airwayBillNumbers: string[];

  constructor(id: string) {
    super();
    this.mawb = id;
  }

  public createMawbToAirwayNumsLookup(airwayBillNumbers: string[]): void {
    this.apply(
      new MawbToAirwayNumsLookupCreatedEvent(this.mawb, airwayBillNumbers),
    );
  }

  public sendMovementToOrderLookupAggregate(
    movementFileData: DetailMovement,
  ): void {
    if (this.airwayBillNumbers.includes(movementFileData.airwayBillNumber)) {
      this.apply(
        new IncomingDetailMovementFileEvent(this.mawb, movementFileData),
      );
    }
  }

  private onMawbToAirwayNumsLookupCreatedEvent(
    createdLookUpReceivedEvent: MawbToAirwayNumsLookupCreatedEvent,
  ) {
    this.airwayBillNumbers = createdLookUpReceivedEvent.airwayNums;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onIncomingDetailMovementEvent(
    incomingDetailMovementEvent: IncomingDetailMovementFileEvent,
  ) {
    return;
  }
}
