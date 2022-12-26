import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const GuardName = 'jwtrefresh';
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(GuardName) {}
