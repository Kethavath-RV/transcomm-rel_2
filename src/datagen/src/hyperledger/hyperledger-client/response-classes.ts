import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import {
  HyperledgerQueryResponse,
  HyperledgerResponse,
  StatusResponse,
  SubscribeResponse,
  Subscription,
  SubscriptionCountResponse,
} from 'core';

class HLFResponseMessage {
  response: string;
  @IsNotEmpty()
  @IsString()
  txnId: string;
}

class HLFQueryResponseMessage {
  response: string;
  data: any;
}

class SubscriptionId {
  subscriptionId: string;
}
export class HyperledgerResponseClass implements HyperledgerResponse {
  @ValidateNested()
  @Type(() => HLFResponseMessage)
  message: HLFResponseMessage;
  error: string;
}

export class StatusResponseClass implements StatusResponse {
  message: string;
}

export class SubscribeResponseClass implements SubscribeResponse {
  message: SubscriptionId;
  error: string;
}

export class SubscriptionCountResponseClass
  implements SubscriptionCountResponse
{
  message: Subscription[];
  error: string;
}

export class HyperledgerQueryResponseClass implements HyperledgerQueryResponse {
  message: HLFQueryResponseMessage;
  error: string;
}
