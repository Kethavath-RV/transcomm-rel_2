import { HyperledgerResponse } from 'core';

export class HyperledgerResponseDto implements HyperledgerResponse {
  error: string;
  message: { response: string; txnId: string };
}
