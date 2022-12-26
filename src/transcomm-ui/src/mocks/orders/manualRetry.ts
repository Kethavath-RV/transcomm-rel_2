import { ManualRetryRequest } from 'core/viewModels';
import { rest } from 'msw';

const baseUrl = '/api/orders';
const endpoint = '/retries';

const mswHandler = (req, res, ctx) => {
  const data: ManualRetryRequest = req.body['data'];

  if (data) {
    return res(ctx.status(200));
  }
  return res(ctx.status(404));
};

// At the moment this only returns if data is passed in.
export const retries = [
  rest.post(`${baseUrl}${endpoint}/purge`, mswHandler),
  rest.post(`${baseUrl}${endpoint}/retryMany`, mswHandler),
];
