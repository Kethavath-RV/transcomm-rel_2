import { PaymentDetail } from 'core';

export class PaymentDetailDto implements PaymentDetail {
  paymentMode: string;
  declarationChargesAccount: string;
}
