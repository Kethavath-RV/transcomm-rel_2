import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Subscription } from './subscriptionModels';
import { BlockHyperledgerEventFromBlockChain } from 'core';

export class BlockSubscriptionManager {
  private subscriptions: Subscription[] = [];

  addSubscription(url: string): string {
    const toAdd: Subscription = {
      subscriptionId: uuidv4(),
      callbackURL: url,
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
    payload: BlockHyperledgerEventFromBlockChain,
  ): Promise<void> {
    for (const subscription of this.subscriptions) {
      try {
        const result = await axios.post(subscription.callbackURL, payload);
        console.log(`${subscription.callbackURL} success ${result.status}`);
      } catch (error) {
        console.log(`${subscription.callbackURL} failed`);
      }
    }
  }
}
