import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirwayNumToOrderIdLookupAggregate } from 'aggregates/airwayNumToOrderIdLookup/airwaynum-orderid-lookup-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { PerformAirwayBillNoToOrderIdLookupMovementCommand } from '../impl/perform-lookup-movement';

@CommandHandler(PerformAirwayBillNoToOrderIdLookupMovementCommand)
export class PerformAirwayBillNoToOrderIdLookupMovementCommandHandler
  implements ICommandHandler<PerformAirwayBillNoToOrderIdLookupMovementCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(
    command: PerformAirwayBillNoToOrderIdLookupMovementCommand,
  ): Promise<void> {
    const { airwayBillNumber, movementFileData } = command;
    this.logger.debug(JSON.stringify(command));

    const lookupAggregate: AirwayNumToOrderIdLookupAggregate | null =
      await this.repository.getById(
        AirwayNumToOrderIdLookupAggregate,
        'airwayToOrderIdLookup',
        airwayBillNumber,
      );

    if (!lookupAggregate) {
      this.logger.warn(
        'no OrderIdLookupAggregate for airwayBillNumber: ' + airwayBillNumber,
      );
      return;
    }

    lookupAggregate.sendMovementToOrderAggregate(movementFileData);
    lookupAggregate.commit();
  }
}
