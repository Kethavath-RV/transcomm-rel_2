import { IsEmail, IsEnum, IsNotEmpty, NotEquals } from 'class-validator';
import { IsPassword } from '../../auth/decorators/password.decorator';
import { UserCreateRequest, UserRole } from 'core';

export class UserCreateRequestDto implements UserCreateRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsPassword()
  password: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEnum(UserRole)
  @NotEquals(UserRole.super_admin)
  role: UserRole;
}
