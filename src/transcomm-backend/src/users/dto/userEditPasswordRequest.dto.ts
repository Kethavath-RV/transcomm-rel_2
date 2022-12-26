import { IsNotEmpty } from 'class-validator';
import { UserEditPasswordRequest } from 'core';

export class UserEditPasswordRequestDto implements UserEditPasswordRequest {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  // Password is validated in user.service
  password: string;
}
