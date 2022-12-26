import { LookupType } from 'core';

export class CreateVcIdLookupCommand {
  constructor(
    public readonly vcId: string,
    public readonly orderNumber: string,
    public readonly ecomCode: string,
    public readonly lookupType: LookupType,
    public readonly invoiceNumber?: string,
    //Below are only applicable if the lookup is for an error
    public readonly commandName?: string,
    public readonly errorCode?: string,
    public readonly errorMessage?: string,
  ) {}
}
