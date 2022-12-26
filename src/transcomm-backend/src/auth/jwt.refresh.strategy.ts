import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from 'users/users.service';
import { Request } from 'express';
import { AuthToken } from 'models/request.models';
import { GuardName } from './jwtrefresh-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'database/token/token.service';
import { UserResponse } from 'core';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, GuardName) {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const tokenData = request?.cookies['access-cookie'];
          return tokenData?.access_token;
        },
      ]),
      passReqToCallback: true,
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(req: Request, accessToken: AuthToken): Promise<UserResponse> {
    const refreshToken = req
      ? req?.cookies['access-cookie']?.refresh_token
      : null;
    if (!refreshToken) {
      throw new BadRequestException();
    }

    let decodedRefresh: AuthToken;
    //check if signed with correctly & not expired.
    try {
      decodedRefresh = this.jwtService.verify(refreshToken, {
        secret: jwtConstants.refreshSecret,
        ignoreExpiration: false,
      });
    } catch (error) {
      console.log('Refresh Token Invalid: ', error);
      throw new UnauthorizedException();
    }

    //check the users in the tokens match
    if (
      accessToken.email != decodedRefresh.email ||
      accessToken.sub != decodedRefresh.sub
    ) {
      throw new UnauthorizedException();
    }

    //Find Refresh Token in DB
    const databaseToken = await this.tokenService.findToken({
      token: refreshToken,
    });
    //Verify Token matches associated user
    if (!databaseToken || databaseToken?.userId != decodedRefresh.sub) {
      throw new UnauthorizedException();
    }
    //retrieve user
    const user = await this.userService.findOneValidById(databaseToken.userId);
    if (!user) {
      console.log('Authorized user not found in user store');
      throw new UnauthorizedException();
    }
    return user;
  }
}
