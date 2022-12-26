import { IsNotEmpty } from "class-validator";
import { DocumentTrackingError } from "core";

export class DocumentTrackingErrorClass implements DocumentTrackingError {
  @IsNotEmpty()
  errorCode: string;
  @IsNotEmpty()
  errorDescription: string;
  errorType: string;
  level: string;
}