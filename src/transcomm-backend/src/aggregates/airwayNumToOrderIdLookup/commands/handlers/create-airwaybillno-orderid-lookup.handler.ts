import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AirwayNumToOrderIdLookupAggregate } from 'aggregates/airwayNumToOrderIdLookup/airwaynum-orderid-lookup-aggregate';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import { CreateAirwayBillToOrderIdLookupCommand } from '../impl/create-airwaybillno-orderid-lookup';

@CommandHandler(CreateAirwayBillToOrderIdLookupCommand)
export class CreateAirwayBillToOrderIdLookupHandler
  implements ICommandHandler<CreateAirwayBillToOrderIdLookupCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly publisher: StoreEventPublisher,
    private readonly repository: AggregateRepository,
  ) { }

  async execute(
    command: CreateAirwayBillToOrderIdLookupCommand,
  ): Promise<void> {
    const { airwayBillNumber, orderNumber, ecomCode } = command;
    this.logger.debug(JSON.stringify(command));

    let lookupAggregate: AirwayNumToOrderIdLookupAggregate | null =
      await this.repository.getById(
        AirwayNumToOrderIdLookupAggregate,
        'airwayToOrderIdLookup',
        airwayBillNumber,
      );
    if (!lookupAggregate) {
      const aggregate = this.publisher.mergeClassContext(
        AirwayNumToOrderIdLookupAggregate,
      );
      lookupAggregate = new aggregate(airwayBillNumber);
    }
    lookupAggregate.createAirwayNumToOrderIdLookup(orderNumber, ecomCode);
    lookupAggregate.commit();
  }
}
