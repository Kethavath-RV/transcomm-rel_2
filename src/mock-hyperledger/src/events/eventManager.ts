import { v4 as uuidv4 } from 'uuid';

export interface MockBlockEvent {
  txId: string;
  block: string;
  function: string;
  payloads: {
    collection: string;
    payload: any;
  }[];
}

export interface MockContractEvent {
  block: string;
  txId?: string;
  eventName: string;
  eventNameForContractItself: string;
  methodName?: string;
  payloads: {
    collection: string;
    payload: any;
    key: string;
  }[];
}

export interface Event {
  key: string;
  collection: string;
  data: any;
  txId: string;
}

export class EventManager {
  private events: Event[] = [];

  addEvent(collection: string, data: any, txId: string, key?: string): string {
    const eventKey = key ? key : uuidv4();
    console.log(`event created with id: ${eventKey}`);
    this.events.push({
      collection,
      data,
      txId,
      key: eventKey,
    });
    return eventKey;
  }

  replaceEvent(key: string, collection: string, data: any): boolean {
    const toChange = this.events.find((x) => x.key == key && x.collection == collection);
    if (toChange) {
      toChange.data = data;
      console.log(`event with id: ${key} replaced`);
      return true;
    }
    return false;
  }

  getEvent(id: string, collection: string): Event | undefined {
    return this.events.find((x) => x.key === id && x.collection === collection);
  }
}
