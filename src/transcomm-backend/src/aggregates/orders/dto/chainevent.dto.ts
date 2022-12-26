import { ChainEventView } from 'core';
import { ChainExceptionDto } from './chainException.dto';

export class ChainEventDto implements ChainEventView {
  eventTime: Date;
  eventType: string;
  exceptions: ChainExceptionDto[]
}
