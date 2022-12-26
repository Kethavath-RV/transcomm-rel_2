import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VcIdLookupAggregate } from 'aggregates/vcIdLookups/vcid-lookup-aggregate';
import { LookupType } from 'core';
import { AggregateRepository } from 'event-sourcing';
import { PerformVcIdLookupCommand } from '../impl/perform-lookup';

@CommandHandler(PerformVcIdLookupCommand)
export class PerformVcIdLookupCommandHandler
  implements ICommandHandler<PerformVcIdLookupCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly repository: AggregateRepository) { }

  async execute(command: PerformVcIdLookupCommand): Promise<void> {
    const { vcId } = command;
    this.logger.debug(JSON.stringify(command));

    const lookupAggregate: VcIdLookupAggregate | null =
      await this.repository.getById(
        VcIdLookupAggregate,
        'vcIdLookup',
        vcId,
      );

    if (!lookupAggregate) {
      this.logger.error('no LookupAggregate for vcId: ' + vcId);
      return;
    }

    if (lookupAggregate.lookupType === LookupType.Error)
      lookupAggregate.toggleErrorIsProcessed()
    else
      lookupAggregate.toggleOrderIsProcessed()

    lookupAggregate.commit();
  }
}
