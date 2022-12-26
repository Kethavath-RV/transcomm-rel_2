import { Currencies } from '../index';

test('order creates', () => {
  const currency: Currencies = Currencies.Albanian;
  expect(currency).toBeDefined();
});
