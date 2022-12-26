import { DHLEDeclarationRequest } from 'core';

export class PerformAirwayBillNoToOrderIdLookupDHLECommand {
  constructor(
    public readonly airwayBillNumber: string,
    public readonly declarationRequestData: DHLEDeclarationRequest,
  ) {}
}
