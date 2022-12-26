import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { BlessClientService } from '../../../../bless/bless-client/bless-client.service';
import { SendDHLEDeclarationResponseCommand } from '../impl/send-dhle-declaration-response';

@CommandHandler(SendDHLEDeclarationResponseCommand)
export class SendDHLEDeclarationResponseHandler
  implements ICommandHandler<SendDHLEDeclarationResponseCommand>
{
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly repository: AggregateRepository,
    private readonly blessService: BlessClientService,
  ) {}

  async execute(command: SendDHLEDeclarationResponseCommand): Promise<void> {
    const { aggregateId, key } = command;
    this.logger.debug(JSON.stringify(command));

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (!orderAggregate) {
      throw Error(
        'No order aggregate found for aggregate id: ' + aggregateId.key(),
      );
    }
    let declarationResponse;

    try {
      declarationResponse =
        orderAggregate.getDeclarationResponseFromMapping(key);
      await this.blessService.postDeclarationResponse(
        declarationResponse,
        orderAggregate.direction,
      );
    } catch (e) {
      orderAggregate.addErrorEvent(
        'SendDHLEDeclarationResponseCommand',
        '',
        JSON.stringify(e),
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    orderAggregate.processDeclarationResponseSentEvent(
      declarationResponse,
      new Date().toISOString(),
    );
    orderAggregate.commit();
  }
}
