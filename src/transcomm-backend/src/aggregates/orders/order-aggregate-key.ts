export class OrderAggregateKey {
  public key = (): string => JSON.stringify([this.orderId, this.ecomCode]);
  constructor(
    public readonly orderId: string,
    public readonly ecomCode: string,
  ) {}
}
