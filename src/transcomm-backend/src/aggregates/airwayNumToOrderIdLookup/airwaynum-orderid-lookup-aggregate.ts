import { AggregateRoot } from '@nestjs/cqrs';
import { DetailMovement, DHLEDeclarationRequest, MasterMovement } from 'core';
import { AirwayBillNumberToOrderIdLookupCreatedEvent } from './events/impl/airwaybillnumber-to-orderid-lookup-created.event';
import { IncomingDeclarationRequestEvent } from './events/impl/incoming-declaration-request.event';
import { IncomingDetailMovementEvent } from './events/impl/incoming-detail-movement.event';
import { IncomingMasterMovementFileEvent } from './events/impl/incoming-master-movement-file.event';

export class AirwayNumToOrderIdLookupAggregate extends AggregateRoot {
  airWayBillId: string;
  orderId: string;
  ecomCode: string;

  constructor(id: string) {
    super();
    this.airWayBillId = id;
  }

  public createAirwayNumToOrderIdLookup(
    orderId: string,
    ecomCode: string,
  ): void {
    this.apply(
      new AirwayBillNumberToOrderIdLookupCreatedEvent(
        this.airWayBillId,
        orderId,
        ecomCode,
      ),
    );
  }

  public sendMovementToOrderAggregate(movementFileData: MasterMovement): void {
    this.apply(
      new IncomingMasterMovementFileEvent(
        this.airWayBillId,
        this.orderId,
        this.ecomCode,
        movementFileData,
      ),
    );
  }

  public sendDetailToOrderAggregate(movementFileData: DetailMovement): void {
    this.apply(
      new IncomingDetailMovementEvent(
        this.airWayBillId,
        this.orderId,
        this.ecomCode,
        movementFileData,
      ),
    );
  }

  public sendDeclarationRequestToOrderAggregate(
    declarationRequestData: DHLEDeclarationRequest,
  ): void {
    this.apply(
      new IncomingDeclarationRequestEvent(
        this.airWayBillId,
        this.orderId,
        this.ecomCode,
        declarationRequestData,
      ),
    );
  }

  private onAirwayBillNumberToOrderIdLookupCreatedEvent(
    createdLookUpReceivedEvent: AirwayBillNumberToOrderIdLookupCreatedEvent,
  ) {
    this.orderId = createdLookUpReceivedEvent.orderId;
    this.ecomCode = createdLookUpReceivedEvent.ecomCode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onIncomingMasterMovementFileEvent(
    incomingMasterMovementFileEvent: IncomingMasterMovementFileEvent,
  ) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onIncomingDetailMovementEvent(
    incomingDetailMovementEvent: IncomingDetailMovementEvent,
  ) {
    return;
  }
}
