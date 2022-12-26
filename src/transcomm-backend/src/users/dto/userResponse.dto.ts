import { UserResponse, UserRole } from 'core';

export class UserResponseDto implements UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  locked: boolean;
}
