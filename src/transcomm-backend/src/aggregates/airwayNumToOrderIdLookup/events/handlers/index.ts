import { IncomingDetailMovementHandler } from './incoming-detail-movement.handler';
import { IncomingMasterMovementFileHandler } from './incoming-master-movement-file.handler';

export const EventHandlers = [
  IncomingMasterMovementFileHandler,
  IncomingDetailMovementHandler,
];
