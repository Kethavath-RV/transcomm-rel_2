export interface Subscription {
  subscriptionId: string;
  callbackURL: string;
}

export interface ContractSubscription extends Subscription {
  eventName: string;
}

export interface SubscriptionNotification {
  txId: string;
  block: string;
  eventName?: string;
  chainCodeId: string;
  payload: {
    key: string;
    collection: string;
  }[];
  privateData?: boolean;
  function?: string;
  namespace?: string;
  collectionName?: string;
}
