import { server } from './src/mocks/node';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


// "references": [
//   {
//     "path": "../core"
//   }
// ]