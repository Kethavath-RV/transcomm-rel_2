import { DeclarationDocument } from 'core';

export class DeclarationDocumentDto implements DeclarationDocument {
  documentCode: string;
  availabilityStatus: string;
  nonAvailabilityReason: string;
  isDepositCollected: string;
}
