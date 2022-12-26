import { rest } from 'msw';
import { UserLogin } from '../../app/models/auth.interface';
import { mockRefreshTokenSuccess } from '../data/mockedRefreshToken';
import { mockedUserResponseArray } from '../data/mockedUserData';
import { RefreshDto } from 'core/viewModels';

const baseUrl = '/api/auth';
const endpoint = '';
export const auth = [
  rest.post(`${baseUrl}/login`, (req, res, ctx) => {
    const data = req.body as UserLogin;
    const foundUserInDb = mockedUserResponseArray.find(
      (user) => user.email === data.email,
    );

    if (!foundUserInDb) {
      return res(ctx.status(401), ctx.json({ message: 'Cant log in' }));
    }

    return res(ctx.status(200), ctx.json(mockRefreshTokenSuccess));
  }),

  rest.post(`${baseUrl}/refresh`, (_req, res, ctx) => {
    const response: RefreshDto = { expires: new Date() };
    return res(ctx.status(200), ctx.json(response));
  }),

  rest.post(`${baseUrl}/logout`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
];
