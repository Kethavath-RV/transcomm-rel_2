/* eslint-disable @typescript-eslint/no-var-requires */
const jestBase = require('../jest.config.json');
module.exports = {
  ...jestBase,
  preset: 'ts-jest',
  rootDir: 'src',
  coverageDirectory: '../coverage',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'test-config',
    'dist',
    'interfaces',
    'jestGlobalMocks.ts',
    '.module.ts',
    'main.ts',
    '.mock.ts',
  ],
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleDirectories: ['src', 'node_modules'],
  transformIgnorePatterns: ['^.+\\.js$'],
};

//,
// "jest": {
//   "moduleFileExtensions": [
//     "js",
//     "json",
//     "ts"
//   ],
//   "rootDir": "src",
//   "testRegex": ".*\\.spec\\.ts$",
//   "transform": {
//     "^.+\\.(t|j)s$": "ts-jest"
//   },
//   "collectCoverageFrom": [
//     "**/*.(t|j)s"
//   ],
//   "coverageDirectory": "../coverage",
//   "testEnvironment": "node"
// }
