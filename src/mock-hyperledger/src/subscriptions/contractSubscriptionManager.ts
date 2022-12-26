import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import {
  ContractSubscription
} from './subscriptionModels';
import { ContractHyperledgerEventFromBlockChain } from 'core';

export class ContractSubscriptionManager {
  private subscriptions: ContractSubscription[] = [];

  addSubscription(url: string, eventName: string): string {
    const toAdd: ContractSubscription = {
      subscriptionId: uuidv4(),
      callbackURL: url,
      eventName: eventName,
    };
    this.subscriptions.push(toAdd);
    console.log(`sub created with id: ${toAdd.subscriptionId}`);
    return toAdd.subscriptionId;
  }

  subscriptionCount(): string[] {
    return this.subscriptions.map((x) => x.subscriptionId);
  }

  removeSubscription(id: string): void {
    const indexToRemove = this.subscriptions.findIndex(
      (x) => x.subscriptionId === id,
    );
    if (indexToRemove !== -1) {
      this.subscriptions.splice(indexToRemove, 1);
    }
  }

  async sendEventNotification(
    payload: ContractHyperledgerEventFromBlockChain,
  ): Promise<void> {
    for (const subscription of this.subscriptions) {
      if (subscription.eventName !== payload.eventName) continue; //skip
      try {
        const result = await axios.post(subscription.callbackURL, payload);
        console.log(`${subscription.callbackURL} success ${result.status}`);
      } catch (error) {
        console.log(`${subscription.callbackURL} failed`);
      }
    }
  }
}
