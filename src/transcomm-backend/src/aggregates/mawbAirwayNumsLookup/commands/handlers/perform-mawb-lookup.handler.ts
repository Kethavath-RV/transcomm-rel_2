import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MawbToAirwayNumsLookupAggregate } from 'aggregates/mawbAirwayNumsLookup/mawb-airwaynums-lookup-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { PerformMawbAirwayNumsLookupCommand } from '../impl/perform-mawb-lookup';

@CommandHandler(PerformMawbAirwayNumsLookupCommand)
export class PerformMawbAirwayNumsLookupCommandCommandHandler
  implements ICommandHandler<PerformMawbAirwayNumsLookupCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: PerformMawbAirwayNumsLookupCommand): Promise<void> {
    const { mawb, movementFileData } = command;
    this.logger.debug(JSON.stringify(command));

    const lookupAggregate: MawbToAirwayNumsLookupAggregate | null =
      await this.repository.getById(
        MawbToAirwayNumsLookupAggregate,
        'mawbToAirwayIdLookup',
        mawb,
      );
    if (!lookupAggregate) {
      throw new Error('no aggregate for mawb: ' + mawb);
    }

    lookupAggregate.sendMovementToOrderLookupAggregate(movementFileData);
    lookupAggregate.commit();
  }
}
