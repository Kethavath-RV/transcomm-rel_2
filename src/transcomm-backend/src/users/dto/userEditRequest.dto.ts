import { IsEmail, IsEnum, IsNotEmpty, NotEquals } from 'class-validator';
import { UserEditRequest, UserRole } from 'core';

export class UserEditRequestDto implements UserEditRequest {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEnum(UserRole)
  @NotEquals(UserRole.super_admin)
  role: UserRole;
}
