import { BaseHyperledgerClient } from './base-hyperledger-client';

describe('BaseHyperledgerClient', () => {
  it('should be defined', () => {
    expect(new BaseHyperledgerClient()).toBeDefined();
  });
});
