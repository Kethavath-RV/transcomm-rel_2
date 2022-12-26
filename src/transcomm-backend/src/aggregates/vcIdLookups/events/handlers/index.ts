import { IncomingErrorProcessedHandler } from './incoming-error-processed.handler';
import { IncomingOrderProcessedHandler } from './incoming-order-processed.handler';

export const EventHandlers = [
    IncomingOrderProcessedHandler,
    IncomingErrorProcessedHandler
];
