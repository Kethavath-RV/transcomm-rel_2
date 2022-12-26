import { OrderAggregate } from '../order-aggregate';
import { orderDetailsParams, OrderView } from './order.view';
import { mockSubmitOrder } from './__mocks__/order.mock';

describe('OrderView', () => {
  it('should be defined', () => {
    expect(new OrderView()).toBeDefined();
  });

  it('should generate order view', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;

    const orderView = new OrderView();
    const args: orderDetailsParams = {
      invoices: []
    }
    const result = orderView.HydrateOrderDetails(aggregate, args);
    expect(result).toBeDefined();
    expect(result.status).toBe(aggregate.status);
  });
});
