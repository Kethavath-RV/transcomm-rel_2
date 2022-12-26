import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { AggregateRepository } from 'event-sourcing';
import { GetOrderQuery } from '../impl/get-order.query';

const aggregateName = 'order';
@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler {
  constructor(private readonly aggregateRepository: AggregateRepository) {}
  async execute(query: GetOrderQuery): Promise<OrderAggregate | null> {
    return this.aggregateRepository.getById(
      OrderAggregate,
      aggregateName,
      query.orderId,
    );
  }
}
