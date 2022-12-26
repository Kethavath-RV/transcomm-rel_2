import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirwayNumToOrderIdLookupAggregate } from 'aggregates/airwayNumToOrderIdLookup/airwaynum-orderid-lookup-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { PerformDetailToOrderIdLookupCommand } from '../impl/perform-detail-lookup';

@CommandHandler(PerformDetailToOrderIdLookupCommand)
export class PerformDetailToOrderIdLookupCommandHandler
  implements ICommandHandler<PerformDetailToOrderIdLookupCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) {}

  async execute(command: PerformDetailToOrderIdLookupCommand): Promise<void> {
    const { airwayBillNumber, movementDetailData } = command;
    this.logger.debug(JSON.stringify(command));

    const lookupAggregate: AirwayNumToOrderIdLookupAggregate | null =
      await this.repository.getById(
        AirwayNumToOrderIdLookupAggregate,
        'airwayToOrderIdLookup',
        airwayBillNumber,
      );

    if (!lookupAggregate) {
      this.logger.error(
        'no OrderIdLookupAggregate for airwayBillNumber: ' + airwayBillNumber,
      );
      return;
    }

    lookupAggregate.sendDetailToOrderAggregate(movementDetailData);
    lookupAggregate.commit();
  }
}
