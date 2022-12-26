import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { CreateOrderCommand } from '../impl/create-order';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly publisher: StoreEventPublisher,
    private readonly repository: AggregateRepository,
  ) { }

  async execute(command: CreateOrderCommand): Promise<void> {
    const { aggregateId, order } = command;
    this.logger.debug(JSON.stringify(command));

    if (!aggregateId.orderId || !aggregateId.ecomCode) {
      // return
      throw Error('Empty order id or ecomCode');
    }

    const orderAggregate = await this.repository.getById(
      OrderAggregate,
      'order',
      aggregateId.key(),
    );
    if (orderAggregate) {
      this.logger.error(`Order already exists ${aggregateId.key()}`);
      orderAggregate.addErrorEvent(
        'CreateOrder',
        '2001001',
        `Error: Order already exists for: ${aggregateId.key()}`,
        new Date().toISOString(),
      );
      orderAggregate.commit();
      return;
    }

    const aggregate = this.publisher.mergeClassContext(OrderAggregate);
    const orderAg = new aggregate(aggregateId.key());
    orderAg.submitOrder(order);
    orderAg.commit();
  }
}
