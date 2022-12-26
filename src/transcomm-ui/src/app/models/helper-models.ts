import { UserRole } from 'core/viewEnums';

export type NewUserRequest = {
  id?: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};
