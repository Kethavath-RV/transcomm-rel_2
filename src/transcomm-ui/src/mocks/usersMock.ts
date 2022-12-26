import { UserResponse, UserRole } from 'core/viewModels';

export const userResponseMock: UserResponse[] = [
  {
    id: '1',
    email: 'as@df.ie',
    firstName: 'as',
    lastName: 'df',
    role: UserRole.admin,
    locked: false,
  },
  {
    id: '2',
    email: 'fd@sa.ie',
    firstName: 's',
    lastName: 'ds',
    role: UserRole.admin,
    locked: false,
  },
];

export const newUserRequestMock = {
  id: '2',
  email: 'fd@sa.ie',
  firstName: 'f',
  lastName: 'new',
  role: UserRole.admin,
};
