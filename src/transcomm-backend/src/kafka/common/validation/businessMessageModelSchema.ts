import { IsNotEmpty } from "class-validator";
import { BusinessMessageModel } from "core";
const decodeBase64 = require('atob');


export class BusinessMessageModelDto implements BusinessMessageModel {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  msgType: string;
  sender: string;
  receivers: Map<string, string[]>;
  issueTime: number;
  trailKey: string;
  trailCreatedOn: number;
  checkpointStatus: string;
  checkpointAttributes: Map<string, string>;
  attachments: any;
  @IsNotEmpty()
  transformedMessage: string;
  sequenceNumber: string;
  f1: string;
  f2: string;
  postProcessingRequired: boolean;
  token: string;
  payloadCreatedOn: number;

  decodeMessage(): string {
    return decodeBase64(this.transformedMessage);
  }
}