import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VcIdLookupAggregate } from 'aggregates/vcIdLookups/vcid-lookup-aggregate';
import { LookupType } from 'core';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import { CreateVcIdLookupCommand } from '../impl/create-vcId-lookup';

@CommandHandler(CreateVcIdLookupCommand)
export class CreateVcIdLookupCommandHandler
  implements ICommandHandler<CreateVcIdLookupCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly publisher: StoreEventPublisher,
    private readonly repository: AggregateRepository,
  ) { }

  async execute(command: CreateVcIdLookupCommand): Promise<void> {
    const { vcId, orderNumber, ecomCode, invoiceNumber, lookupType, commandName, errorCode, errorMessage } = command;
    this.logger.debug(JSON.stringify(command));

    const lookupAggregate: VcIdLookupAggregate | null =
      await this.repository.getById(
        VcIdLookupAggregate,
        'vcIdLookup',
        vcId,
      );

    if (lookupAggregate) {
      this.logger.error(`Lookup already exists for vcId: ${vcId}`);
      return;
    }

    const aggregate = this.publisher.mergeClassContext(VcIdLookupAggregate);
    const newLookupAggregate = new aggregate(vcId);

    if (lookupType === LookupType.Error) {
      newLookupAggregate.createVcIdLookupForError(
        lookupType,
        orderNumber,
        ecomCode,
        invoiceNumber,
        commandName,
        errorCode,
        errorMessage
      )
    }
    else {
      newLookupAggregate.createVcIdLookupForOrder(
        orderNumber,
        ecomCode,
        lookupType,
        invoiceNumber,
      );
    }
    newLookupAggregate.commit();
  }
}
