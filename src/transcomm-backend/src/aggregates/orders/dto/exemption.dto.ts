import { Exemption, ExemptionType } from 'core';

export class ExemptionDto implements Exemption {
  exemptionType: ExemptionType;
  exemptionRefNo: string;
}
