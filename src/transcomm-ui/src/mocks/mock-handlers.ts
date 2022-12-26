import { auth } from './auth/authEndpoints';
import { retries } from './orders/manualRetry';
import { returned } from './orders/returned';
import { secrets } from './secrets/secrets';
import { tests } from './testEndpoints/testEndpoints';
import { users } from './users/users';

export const mockHandlers = [
  ...returned,
  ...tests,
  ...retries,
  ...users,
  ...secrets,
  ...auth,
];
