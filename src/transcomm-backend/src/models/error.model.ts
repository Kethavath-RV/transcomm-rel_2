import { HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { ApplicationErrorBase, ApplicationErrorOptions } from 'core';

export class ApplicationError extends ApplicationErrorBase {
  constructor(options?: ApplicationErrorOptions) {
    super(options);
  }
  public addBaseErrors(error: AxiosError): void {
    this.path = `${error.config.baseURL}${error.config.url}`;
    this.errorName = error.name;
    this.errorMessage = error.message ?? '';
  }

  public addStatusRelatedErrors(
    errorStatus: HttpStatus,
    application: 'HL' | 'DG',
  ): void {
    const appName = application === 'HL' ? 'hyperledger' : 'datagen';
    this.status = errorStatus;
    this.errorCode = `${application}${this.status}`;
    switch (errorStatus) {
      case HttpStatus.BAD_REQUEST:
        this.descriptiveMessage = `The request sent to the ${appName} was incorrect`;
        break;
      case HttpStatus.UNAUTHORIZED:
        this.descriptiveMessage = 'The account is unauthorized';
        break;
      case HttpStatus.NOT_ACCEPTABLE:
        this.descriptiveMessage = `Unexpected response from the ${appName}`;
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.descriptiveMessage = `Technical difficulties are being experienced by the ${appName}`;
        break;
      case HttpStatus.SERVICE_UNAVAILABLE:
        this.descriptiveMessage = `Cannot connect to the ${appName}`;
        break;
      default:
        this.descriptiveMessage = 'Unknown issue';
    }
  }
}
