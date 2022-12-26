import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles defined, forbid access
    if (!allowedRoles) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user.role;

    return allowedRoles.includes(userRole);
  }
}
