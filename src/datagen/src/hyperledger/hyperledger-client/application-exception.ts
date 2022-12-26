import { HttpException, HttpStatus } from '@nestjs/common';
import { ApplicationError } from './error.models';

export class ApplicationException extends HttpException {
  constructor(dgObject: ApplicationError, status: HttpStatus) {
    super(dgObject, status);
  }
}
