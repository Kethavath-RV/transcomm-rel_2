import { ManualRetryView } from "core";

export class ManualRetryDTO implements ManualRetryView {
  orderNumber: string;
  invoiceNumber: string;
  ecomCode: string;
  contractType: string;
  errorCode: string;
  errorDesc: string;
  failDate: Date;
  status: string;
  retryButton: boolean;
  contractMethod: string;
  remark: string | null;
}