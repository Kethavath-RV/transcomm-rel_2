export class CreateMawbToAirwaynumsLookupCommand {
  constructor(
    public readonly mawb: string,
    public readonly airwayBillNumbers: string[],
  ) {}
}
