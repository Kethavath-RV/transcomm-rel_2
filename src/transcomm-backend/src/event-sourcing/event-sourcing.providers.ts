import { AggregateRepository } from './aggregate-repository';
import { StoreEventBus } from './store-event-bus';
import { StoreEventPublisher } from './store-event-publisher';
import { ViewEventBus, ViewMaterializer } from './view-materializers';

export function createEventSourcingProviders() {
  return [
    AggregateRepository,
    ViewMaterializer,
    ViewEventBus,
    StoreEventBus,
    StoreEventPublisher,
  ];
}
