import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';

const orderNumber = 'test';
const ecomCode = 'test';

export const AggregateKey: OrderAggregateKey = new OrderAggregateKey(
  orderNumber,
  ecomCode,
);
