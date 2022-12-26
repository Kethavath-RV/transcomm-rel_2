import { SubmitOrder } from 'core';
import { mockDeep } from 'jest-mock-extended';
import { OrderAggregate } from '../order-aggregate';
import { AddressView } from './address.view';

const mockSubmitOrder = mockDeep<SubmitOrder>();

describe('AddressView', () => {
  it('should be defined', () => {
    expect(new AddressView()).toBeDefined();
  });

  it('should hydrate all addresses if present', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.order = mockSubmitOrder;

    const addressView = new AddressView();
    const result = addressView.HydrateAddresses(aggregate);

    expect(result.length).toBe(3);
  });

  it('should hydrate only the addresses present (no ship)', () => {
    const aggregate = new OrderAggregate('test');
    const { shipTo, shipToAddress, ...rest } = mockSubmitOrder;
    aggregate.order = rest;

    const addressView = new AddressView();
    const result = addressView.HydrateAddresses(aggregate);

    expect(result.length).toBe(2);
  });

  it('should hydrate only the addresses present (no ship or consign)', () => {
    const aggregate = new OrderAggregate('test');
    const { shipTo, shipToAddress, consigneeAddress, consigneeName, ...rest } =
      mockSubmitOrder;
    aggregate.order = rest;

    const addressView = new AddressView();
    const result = addressView.HydrateAddresses(aggregate);

    expect(result.length).toBe(1);
  });
});
