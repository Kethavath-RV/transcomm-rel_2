import { DeclarationCharge, ResponseJSONPayload } from './hl-events';
import { CustomsStatus, declarationType } from './valueEnums';

export interface DeclarationResponse {
  Module: string;
  MsgEntryNo: string;
  result: Result;
}

export interface Result {
  UTH: Uth;
  UNB: Unb;
  UNH: Unh;
  UNZ: Unz;
  response: Response;
}

export interface DocumentTrackingArguments {
  requestNo: string;
  declarationNo: string;
  statusRemarks: string;
  acceptanceDate: string;
}

export interface JSONMappingArguments {
  msgEntryNo: string;
  interchangeControlReference: string;
  dateTime: string;
  messageVersionNumber: string;
  recipientIdentification: string;
  shippingAirlineAgentCode: string;
  masterTransportDocumentNo: string;
  outboundHouseTransportDocumentNo: string;
  declarantReferenceNo: string;
  declarationType: string;
}

export interface Unb {
  InterchangeControlReference: string | null;
  DateTime: string;
  MessageVersionNumber: string;
  RecipientIdentification: string;
  MessageCode: string;
  SenderIdentification: string;
}

export interface Unh {
  MessageType: null | string;
  MessageReferenceNumber: null | string; //Number or string?
}

export interface Unz {
  CheckSumCode: string;
  InterchangeControlCount: string;
}

export interface Uth {
  ReplytoTransportMode: string;
  ReplytoMessageFormat: string;
  UseSynchronousMode: string;
  ReplytoAddress: string;
}

export interface Response {
  responseHeader: ResponseHeader;
  consignments: Consignment[];
}

export interface Consignment {
  inboundHouseTransportDocumentNo: string;
  outboundHouseTransportDocumentNo: string | null;
  declarationResponse: DeclarationResponseSub;
}

export interface DeclarationResponseSub {
  declarationStatus: string;
  collectionPaymentAdvice: CollectionPaymentAdvice;
  controllingAuthority: null | string;
  declarantReferenceNo: string;
  declarationNumber: string;
  declarationType: string;
  statusRemarks: string;
  acceptanceDate: string;
  requestNo: string;
}

export interface CollectionPaymentAdvice {
  adviceNo: string;
  adviceType: string;
  adviceAmount: string;
  collectionPaymentAdviceLineDetails: CollectionPaymentAdviceLineDetail[];
  collectionPaymentReceiptDetails: CollectionPaymentReceiptDetail[];
}

export interface CollectionPaymentAdviceLineDetail {
  chargeAmount: string;
  chargeType: string;
}

export interface CollectionPaymentReceiptDetail {
  receiptAmount: string;
  receiptType: string;
  receiptNumber: number;
}

export interface ResponseHeader {
  requestNo: string;
  shippingAirlineAgentCode: string;
  masterTransportDocumentNo: string;
}

export interface DeclarationResponseCompletion {
  documentTracking: boolean;
  declarationJSONMapping: boolean;
}

export interface DeclarationResponseStatus {
  key: string;
  isFilled: FillStatus;
}

export enum FillStatus {
  Empty,
  Partial,
  Complete,
}

export class DeclarationResponseClass implements DeclarationResponse {
  Module = '';
  MsgEntryNo = '';
  result: Result = {
    UTH: {
      ReplytoTransportMode: '',
      ReplytoMessageFormat: '',
      UseSynchronousMode: '',
      ReplytoAddress: '',
    },
    UNB: {
      InterchangeControlReference: null,
      DateTime: '',
      MessageVersionNumber: '',
      RecipientIdentification: '',
      MessageCode: '',
      SenderIdentification: '',
    },
    UNH: {
      MessageType: null,
      MessageReferenceNumber: null,
    },
    UNZ: {
      CheckSumCode: '',
      InterchangeControlCount: '',
    },
    response: {
      responseHeader: {
        requestNo: '',
        shippingAirlineAgentCode: '',
        masterTransportDocumentNo: '',
      },
      consignments: [
        {
          inboundHouseTransportDocumentNo: '',
          outboundHouseTransportDocumentNo: '',
          declarationResponse: {
            declarationStatus: '',
            collectionPaymentAdvice: {
              adviceNo: '',
              adviceType: '',
              adviceAmount: '',
              collectionPaymentAdviceLineDetails:
                [] as CollectionPaymentAdviceLineDetail[],
              collectionPaymentReceiptDetails: [
                {
                  receiptAmount: '0',
                  receiptType: '0',
                  receiptNumber: 0,
                },
              ],
            },
            controllingAuthority: null,
            declarantReferenceNo: '',
            declarationNumber: '',
            declarationType: '',
            statusRemarks: '',
            acceptanceDate: '',
            requestNo: '',
          },
        },
      ],
    },
  };

  public addJSONMappingData(argumentsObject: JSONMappingArguments): void {
    const {
      msgEntryNo,
      interchangeControlReference,
      dateTime,
      messageVersionNumber,
      recipientIdentification,
      shippingAirlineAgentCode,
      masterTransportDocumentNo,
      outboundHouseTransportDocumentNo,
      declarantReferenceNo,
      declarationType,
    } = argumentsObject;
    const unb = this.result.UNB;
    const responseHeader = this.result.response.responseHeader;
    const consignment = this.result.response.consignments[0];
    this.MsgEntryNo = msgEntryNo;
    unb.InterchangeControlReference = interchangeControlReference;
    unb.DateTime = dateTime;
    unb.MessageVersionNumber = messageVersionNumber;
    unb.RecipientIdentification = recipientIdentification;
    unb.SenderIdentification = recipientIdentification;
    responseHeader.shippingAirlineAgentCode = shippingAirlineAgentCode;
    responseHeader.masterTransportDocumentNo = masterTransportDocumentNo;
    consignment.outboundHouseTransportDocumentNo =
      outboundHouseTransportDocumentNo;
    consignment.declarationResponse.declarantReferenceNo = declarantReferenceNo;
    consignment.declarationResponse.declarationType = declarationType;
  }

  public addDocumentTrackingData(argumentsObject: DocumentTrackingArguments) {
    const { requestNo, declarationNo, statusRemarks, acceptanceDate } =
      argumentsObject;
    const declarationResponse =
      this.result.response.consignments[0].declarationResponse;
    this.result.response.responseHeader.requestNo = requestNo;
    declarationResponse.declarationNumber = declarationNo;
    declarationResponse.statusRemarks = statusRemarks;
    declarationResponse.acceptanceDate = acceptanceDate;
  }

  public fillCollectionPaymentAdviceLineDetails(responseJSONPayload: string) {
    const collectionPaymentAdviceLineDetails =
      this.result.response.consignments[0].declarationResponse
        .collectionPaymentAdvice.collectionPaymentAdviceLineDetails;

    if (!responseJSONPayload) {
      if (!collectionPaymentAdviceLineDetails.length) {
        collectionPaymentAdviceLineDetails.push({
          chargeAmount: '',
          chargeType: '',
        });
      }
    } else {
      const parsedResponseJSONPayload: ResponseJSONPayload =
        JSON.parse(responseJSONPayload);

      parsedResponseJSONPayload.DataArea.BOD.ResponseDetails.DeclarationCharges.forEach(
        (declarationCharge) => {
          const keys = Object.keys(declarationCharge);
          if (keys.length) {
            const collectionPaymentAdviceLineDetail =
              {} as CollectionPaymentAdviceLineDetail;
            keys.forEach((key) => {
              collectionPaymentAdviceLineDetail[
                key as keyof CollectionPaymentAdviceLineDetail
              ] =
                declarationCharge[key as keyof DeclarationCharge].toString() ??
                '';
            });
            collectionPaymentAdviceLineDetails.push(
              collectionPaymentAdviceLineDetail,
            );
          }
        },
      );
    }
  }

  public convertCustomsStatus(customsStatus: string) {
    const consignment = this.result.response.consignments[0];
    switch (declarationType[customsStatus]) {
      case CustomsStatus.Cleared:
      case CustomsStatus.ClearanceSubjectToInspection:
        consignment.declarationResponse.declarationStatus = '6';
        break;
      case CustomsStatus.Cancelled:
      case CustomsStatus.Declined:
      case CustomsStatus.Suspend:
        consignment.declarationResponse.declarationStatus = '10';
        break;
      default:
        consignment.declarationResponse.declarationStatus = customsStatus;
    }
  }
}
