import { BODHeader, ClaimCreationRequest, ClaimRequestApplicationArea, ClaimRequestData, ClaimRequestDataArea, ClaimRequestReceive, ClaimRequestSender, Receiver } from "core";


const mockClaimRequestSender: ClaimRequestSender = {
  AuthorizationID: '',
  ComponentID: '',
  ConfirmationCode: '',
  LogicalID: '',
  ReferenceID: '',
  TaskID: '',
}

const mockReceiver: Receiver = {
  AuthorizationID: '',
  ComponentID: '',
  ConfirmationCode: '',
  LogicalID: '',
  ReferenceID: '',
  TaskID: '',
}

const mockClaimRequestApplicationArea: ClaimRequestApplicationArea = {
  BODID: '',
  CreationDateTime: '',
  Receiver: mockReceiver,
  Sender: mockClaimRequestSender,
  Signature: '',
}

const mockBODHeader: BODHeader = {
  LanguageCode: '',
  ReleaseID: '',
  SystemEnvironmentCode: '',
  VersionID: '',
}

const mockClaimCreationRequest: ClaimCreationRequest = {
  AccountNumber: '',
  ClaimRegistrationDateTime: '',
  DeclarationNumber: '',
  DepartureDateTime: '',
}

const mockClaimRequestReceive: ClaimRequestReceive = {
  '-acknowledgeCode': '',
  '-self-closing': '',
}

const mockClaimRequestDataArea: ClaimRequestDataArea = {
  ClaimCreationRequest: mockClaimCreationRequest,
  Receive: mockClaimRequestReceive,
}


export const mockClaimRequest: ClaimRequestData = {
  ApplicationArea: mockClaimRequestApplicationArea,
  BODHeader: mockBODHeader,
  DataArea: mockClaimRequestDataArea,
  DocumentName: '',
  Key: '',
}