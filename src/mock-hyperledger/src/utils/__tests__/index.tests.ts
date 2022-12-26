import { randomPhrase } from '../randomPhrase';

test('basic', () => {
  expect(randomPhrase()).toBeUndefined();
});

test('basic again', () => {
  expect(randomPhrase('cool', 'ok')).toBeDefined();
});
