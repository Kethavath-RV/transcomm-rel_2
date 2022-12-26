import { rest } from 'msw';

const baseUrl = '/api/orders';
const endpoint = '/returnedOrders';

export const returned = [
  rest.post(`${baseUrl}${endpoint}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(req));
  }),
];
