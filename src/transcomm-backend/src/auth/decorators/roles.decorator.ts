import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'core';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
