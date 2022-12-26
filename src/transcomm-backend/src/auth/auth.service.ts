import { Injectable } from '@nestjs/common';
import { UsersService } from 'users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthResponse, AuthToken } from 'models/request.models';
import { jwtConstants } from './constants';
import { TokenService } from 'database/token/token.service';
import { UserResponse } from 'core';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}
  readonly saltOrRounds = 10;

  private createToken = (email: string, userId: string): AuthToken => ({
    email: email,
    sub: userId,
    issuer: 'DHLTransCom',
  });

  private refreshTokenOptions = () => ({
    secret: jwtConstants.refreshSecret,
    expiresIn: jwtConstants.refreshTokenTime,
  });
  private accessTokenOptions = () => ({
    secret: jwtConstants.secret,
    expiresIn: jwtConstants.accessTokenTime,
  });

  async validateUser(
    email: string,
    passwordInput: string,
  ): Promise<UserResponse | null> {
    const user = await this.usersService.findOneValid(email);
    if (user) {
      const compareResult = await bcrypt.compare(passwordInput, user.password);
      if (compareResult) {
        if (user.failedLoginAttempts != 0) {
          return this.usersService.resetFailedLoginAttempts(user);
        } else {
          const { password, ...userInfo } = user;
          return userInfo;
        }
      } else {
        await this.usersService.handleFailedLoginAttempt(user);
      }
    }
    return null;
  }

  async login(
    user: UserResponse,
    generateRefreshToken: boolean,
  ): Promise<AuthResponse> {
    let refreshToken = '';
    const accessToken = this.generateAccessToken(user.id, user.email);
    if (generateRefreshToken) {
      refreshToken = await this.generateRefreshToken(user.id, user.email);
    }
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(userId: string, userName: string) {
    const payload = this.createToken(userName, userId);
    return this.jwtService.sign(payload, this.accessTokenOptions());
  }

  private async generateRefreshToken(userId: string, userName: string) {
    const payload = this.createToken(userName, userId);
    await this.tokenService.removeRefreshTokenForUser(userId); //clear existing refresh tokens
    const refreshToken = this.jwtService.sign(
      payload,
      this.refreshTokenOptions(),
    );
    await this.tokenService.createToken({ token: refreshToken }, userId);
    return refreshToken;
  }
}
