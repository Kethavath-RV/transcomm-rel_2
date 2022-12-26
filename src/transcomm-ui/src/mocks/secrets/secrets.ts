import { rest } from 'msw';
import { mockSecretResponse } from '../data/mockedSecretResponse';

const baseUrl = '/api/admin';
const endpoint = '/updateSecrets';

export const secrets = [
  rest.post(`${baseUrl}${endpoint}`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockSecretResponse));
  }),
];
