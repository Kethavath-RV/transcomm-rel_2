import { AxiosRequestConfig } from 'axios';
import {
  InvokeRequest,
  SubscribeEventRequest,
  UnsubscribeEventRequest,
  AuthenticationRequest,
} from 'core';

export class BaseHyperledgerClient {
  protected createSubmitOrQueryFormBody(
    channelName: string,
    chaincodeName: string,
    methodName: string,
    methodParams: string[],
    transientValue: string,
  ): string {
    const details: InvokeRequest = {
      channelName: channelName,
      chaincodeName: chaincodeName,
      methodName: methodName,
      methodParams: methodParams,
      isTxnPvt: true,
      transientKey: 'PrivateArgs',
      transientValue: transientValue,
    };
    return this.createFormEntries(details);
  }

  protected createSubscribeEventFormBody(
    channelName: string,
    chaincodeName: string,
    eventCategory: string,
    eventName: string,
    eventType: string,
    startblock: number,
    callbackUrl: string,
  ): string {
    const details: SubscribeEventRequest = {
      channelName: channelName,
      chaincodeName: chaincodeName,
      eventCategory: eventCategory,
      eventName: eventName,
      eventType: eventType,
      startBlock: startblock,
      callbackURL: callbackUrl,
    };

    return this.createFormEntries(details);
  }

  protected createUnsubscribeEventFormBody(id: string): string {
    const details: UnsubscribeEventRequest = {
      id: id,
    };

    return this.createFormEntries(details);
  }

  protected createAxiosConfig(
    authToken: string,
    contentLength?: number,
  ): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Length': contentLength ?? 0,
      }
    };
  }

  protected createAuthenticateFormBody(clientID: string): string {
    const details: AuthenticationRequest = {
      clientID: clientID,
    };

    return this.createFormEntries(details);
  }

  private createFormEntries<T>(details: T) {
    const formEntries: string[] = [];
    Object.entries(details).forEach(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      if (Array.isArray(value)) {
        value = JSON.stringify(value)
      }
      const encodedValue = encodeURIComponent(value);
      formEntries.push(encodedKey + '=' + encodedValue);
    });

    return formEntries.join('&');
  }
}
