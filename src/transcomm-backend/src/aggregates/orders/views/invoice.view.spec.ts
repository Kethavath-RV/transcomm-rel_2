import { OrderAggregate } from '../order-aggregate';
import { InvoiceView } from './invoice.view';
import { mockSubmitOrder } from './__mocks__/order.mock';

describe('InvoiceView', () => {
  it('should be defined', () => {
    expect(new InvoiceView()).toBeDefined();
  });

  it('should generate invoice views', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;

    const addressView = new InvoiceView();
    const result = addressView.HydrateInvoices(aggregate);
    expect(result.length).toBe(aggregate.order.invoices.length);
    expect(result[0].orderLine?.createMany).toBeDefined();
  });
});
