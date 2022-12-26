import { HyperledgerResponse } from 'core';

export interface HyperledgerClient {
  invokeSubmitOrder(
    req: string,
    orderNumber: string,
  ): Promise<HyperledgerResponse>;
  invokeUpdateTransportInfo(req: string): Promise<HyperledgerResponse>;
  invokeInitiateDeclaration(req: string): Promise<HyperledgerResponse>;
  invokeDeliverOrder(req: string): Promise<HyperledgerResponse>;
  invokeConfirmReturnDelivery(req: string): Promise<HyperledgerResponse>;
}
