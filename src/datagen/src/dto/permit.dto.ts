import { Permit, PermitIssuingAuthorityCode, YesNo } from 'core';

export class PermitDto implements Permit {
  referenceNo: string;
  issuingAuthorityCode: PermitIssuingAuthorityCode;
  notRequiredFlag: YesNo;
}
