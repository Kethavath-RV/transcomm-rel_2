import { ClaimView } from 'core';

export class ClaimDto implements ClaimView {
  ecomBusinessCode: string;
  orderNumber: string;
  invoiceNumber: string;
  requestDate: Date;
  currentStage: string;
  claimStatus: string;
  declarationNumber: string;
  claimNumber: string;
  claimType: string;
  transportDocumentNumber: string;
}
