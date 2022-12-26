import { DeclarationView } from 'core';
import { ClaimDto } from './claim.dto';
import { DeclarationErrorDto } from './declarationError.dto';

export class DeclarationDto implements DeclarationView {
  declarationType: string | null;
  declarationNumber: string | null;
  batchId: string | null;
  clearanceStatus: string;
  version: string | null;
  invoiceNumber: string;
  shipmentMode: string | null;
  regimeType: string | null;
  exportCodeMirsalTwo: string | null;
  recipientIdentification: string | null;
  senderIdentification: string | null;
  numberOfPages: number | null;
  errorType: string | null;
  direction: string | null;
  returnRequestNo: string | null;
  createdAt: string | null;
  bodId: string | null;
  chargeAmount: string | null;
  chargeType: string | null;
  errors: DeclarationErrorDto[];
  claim?: ClaimDto;
}
