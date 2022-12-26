export class CreateAirwayBillToOrderIdLookupCommand {
  constructor(
    public readonly airwayBillNumber: string,
    public readonly orderNumber: string,
    public readonly ecomCode: string,
  ) {}
}
