import { DeclarationErrorView } from "core";

export class DeclarationErrorDto implements DeclarationErrorView {
  id: string;
  errorCode: string;
  errorDescription: string;
  errorType: string;
  level: string;
  orderId: string;
  ecomBusinessCode: string;
}