import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MawbToAirwayNumsLookupAggregate } from 'aggregates/mawbAirwayNumsLookup/mawb-airwaynums-lookup-aggregate';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import { CreateMawbToAirwaynumsLookupCommand } from '../impl/create-mawb-airwaynums-lookup';

@CommandHandler(CreateMawbToAirwaynumsLookupCommand)
export class CreateMawbToAirwaynumsLookupCommandHandler
  implements ICommandHandler<CreateMawbToAirwaynumsLookupCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly publisher: StoreEventPublisher,
    private readonly repository: AggregateRepository,
  ) { }

  async execute(command: CreateMawbToAirwaynumsLookupCommand): Promise<void> {
    const { mawb, airwayBillNumbers } = command;
    this.logger.debug(JSON.stringify(command));

    let lookupAggregate: MawbToAirwayNumsLookupAggregate | null =
      await this.repository.getById(
        MawbToAirwayNumsLookupAggregate,
        'mawbToAirwayIdLookup',
        mawb,
      );
    if (!lookupAggregate) {
      const aggregate = this.publisher.mergeClassContext(
        MawbToAirwayNumsLookupAggregate,
      );
      lookupAggregate = new aggregate(mawb);
    }
    lookupAggregate.createMawbToAirwayNumsLookup(airwayBillNumbers);
    lookupAggregate.commit();
  }
}
