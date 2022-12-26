import { UserResponse } from 'core/viewModels';
import { rest } from 'msw';
import { NewUserRequest } from '../../app/models/helper-models';
import {
  mockedNewNewUserResponse,
  mockedUserResponseArray,
} from '../data/mockedUserData';

const baseUrl = '/api/users';
const endpoint = '';
export const users = [
  rest.post(`${baseUrl}${endpoint}/register`, (req, res, ctx) => {
    const data = req.body as NewUserRequest;
    const foundUserInDb = mockedUserResponseArray.find(
      (user) => user.email === data.email,
    );

    if (foundUserInDb) {
      return res(ctx.status(400), ctx.json({ message: 'User already exists' }));
    }
    const newUser: UserResponse = {
      id: mockedNewNewUserResponse.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      locked: false,
      role: data.role,
    };
    return res(ctx.status(200), ctx.json(newUser));
  }),

  rest.delete(`${baseUrl}${endpoint}/:id`, (req, res, ctx) => {
    if (!req.params.id) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    const matchedObject = mockedUserResponseArray.find(
      (obj) => obj.id === req.params.id,
    );

    if (!matchedObject) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    return res(ctx.status(200), ctx.json(matchedObject));
  }),

  rest.put(`${baseUrl}${endpoint}`, (req, res, ctx) => {
    const data = req.body as NewUserRequest;
    let foundUserInDb = mockedUserResponseArray.find(
      (user) => user.id === data.id,
    );
    if (!foundUserInDb) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    foundUserInDb = {
      ...foundUserInDb,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    return res(ctx.status(200), ctx.json(foundUserInDb));
  }),

  rest.put(`${baseUrl}${endpoint}/password`, (req, res, ctx) => {
    const data = req.body as NewUserRequest;
    const foundUserInDb = mockedUserResponseArray.find(
      (user) => user.id === data.id,
    );
    if (!foundUserInDb) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    return res(ctx.status(200), ctx.json(foundUserInDb));
  }),

  rest.get(`${baseUrl}/current`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockedUserResponseArray[0]));
  }),
];
