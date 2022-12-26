export interface BusinessMessageModel {
  id: string;
  msgType: string;
  sender: string;
  receivers: Map<string, string[]>;
  issueTime: number;
  trailKey: string;
  trailCreatedOn: number;
  checkpointStatus: string;
  checkpointAttributes: Map<string, string>;
  attachments: any;
  transformedMessage: string;
  sequenceNumber: string;
  f1: string;
  f2: string;
  postProcessingRequired: boolean;
  token: string;
  payloadCreatedOn: number;
}

export interface PickupMovementsMessageModel {
  msgType: string;
  sender: string;
  uuid: string;
  msgFilePath: string;
  messages: string;
}

export interface NotificationMessageModel {
  id: string;
  type: NotificationType;
  content: string;
}

export enum NotificationType {
  delete = 'DELETE',
  forwardonly = 'FORWARDONLY',
  processed = 'PROCESSED',
}

export interface OutputMessageModel {
  id: string;
  msgType: string;
  payloads: string[];
  audience: string;
  receivers: {
    primary: string[];
    secondary: string[];
  };
  primary: boolean;
  applicationId: string;
  sender: string;
  issueTimeFLag: boolean;
}

export interface ErrorMessagePayloadModel {
  id: string;
  errorCode: string;
  dateTime: string;
  errorDesc: string;
  msgIdentifier: {
    orderNumber: string;
    invoiceId?: string;
    txnId?: string;
    ecomBusinessCode: string;
  };
}
