import { ChainExceptionView } from 'core';

export class ChainExceptionDto implements ChainExceptionView {
  exceptionCode: string;
  exceptionDetail: string;
}
