import { ReturnDetail, ReturnReason } from 'core';

export class ReturnDetailDto implements ReturnDetail {
  returnRequestNo: string;
  prevTransportDocNo: string;
  returnReason: ReturnReason;
  returnTransportDocNo: string;
  prevDeclarationReference: string;
  declarationPurposeDetails: string;
}
