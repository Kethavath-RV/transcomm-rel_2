import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { AuthToken } from '../models/request.models';
import { ReturnUser } from 'models/user.models';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const tokenData = request?.cookies['access-cookie'];
          return tokenData?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: AuthToken): Promise<ReturnUser> {
    const user = await this.userService.findOneValid(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const {
      password,
      locked,
      archived,
      failedLoginAttempts,
      createdAt,
      updatedAt,
      archivedAt,
      ...rest
    } = user;
    return rest;
  }
}
