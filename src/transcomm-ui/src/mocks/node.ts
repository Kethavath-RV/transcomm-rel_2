import { setupServer } from 'msw/node';
import { mockHandlers } from './mock-handlers';

const server = setupServer(...mockHandlers);
export { server };
