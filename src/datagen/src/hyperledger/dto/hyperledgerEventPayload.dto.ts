import { EventPayload } from 'core';

export class HyperledgerEventPayloadDto implements EventPayload {
  Key: string;
  Collection: string;
}
