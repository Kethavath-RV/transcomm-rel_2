/* eslint-disable @typescript-eslint/no-var-requires */
const jestBase = require('../jest.config.json');
module.exports = {
  ...jestBase,
  preset: 'ts-jest',
};
