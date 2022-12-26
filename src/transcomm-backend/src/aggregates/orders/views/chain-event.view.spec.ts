import { OrderAggregate } from '../order-aggregate';
import { ChainEventView } from './chain-event.view';

describe('ChainEventView', () => {
  it('should be defined', () => {
    expect(new ChainEventView()).toBeDefined();
  });

  it('should hydrate the chain events (no exceptions)', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.eventChain = [
      {
        eventTime: new Date(),
        eventType: 'test',
        exceptions: []
      }
    ];
    const chainView = new ChainEventView();
    const result = chainView.HydrateChainEvents(aggregate);
    expect(result.length).toBe(aggregate.eventChain.length);
  });

  it('should hydrate the chain events with exceptions', () => {
    const aggregate = new OrderAggregate('test');
    aggregate.eventChain = [
      {
        eventTime: new Date(),
        eventType: 'test',
        exceptions: [
          {
            exceptionCode: 'test',
            exceptionDetail: 'test'
          }
        ]
      }
    ];
    const chainView = new ChainEventView();
    const result = chainView.HydrateChainEvents(aggregate);
    expect(result.length).toBe(aggregate.eventChain.length);
    expect(result[0].exceptions).toBeDefined();
  });
});
