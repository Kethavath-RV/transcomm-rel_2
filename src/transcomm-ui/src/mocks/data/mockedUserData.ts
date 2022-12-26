import { UserResponse } from 'core/viewModels';
import { UserLogin } from '../../app/models/auth.interface';
import { NewUserRequest } from '../../app/models/helper-models';

export const mockedNewNewUserRequest: NewUserRequest = {
  email: 'a@b.cd',
  firstName: 'a',
  lastName: 'b',
  role: 'admin',
  password: 'HelloWorld01!HelloWorld01!',
};
export const mockedNewNewUserResponse: UserResponse = {
  id: 'new',
  email: 'a@b.cd',
  firstName: 'a',
  lastName: 'b',
  role: 'admin',
  locked: false,
};

export const mockedExistingNewUserRequest: NewUserRequest = {
  email: 'test1@test.nl',
  firstName: 'a',
  lastName: 'b',
  role: 'admin',
  password: 'HelloWorld01!HelloWorld01!',
};

export const mockedUserLogin: UserLogin = {
  email: 'thisIsMy@email.com',
  password: 'LiterallyHelloWorld1!',
};

export const mockedUser: UserResponse = {
  id: 'asdf-1234',
  email: 'thisIsMy@email.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  locked: false,
};

export const mockedUserResponseArray: UserResponse[] = [
  {
    id: '1',
    email: 'test1@test.nl',
    firstName: 'a',
    lastName: 'b',
    role: 'admin',
    locked: false,
  },
  {
    id: '2',
    email: 'test2@test.nl',
    firstName: 'a',
    lastName: 'b',
    role: 'admin',
    locked: false,
  },
  {
    id: '3',
    email: 'test3@test.nl',
    firstName: 'a',
    lastName: 'b',
    role: 'admin',
    locked: false,
  },
  mockedUser,
];
