import { Controller, Post, Request, Response, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UserRequest } from 'models/request.models';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshAuthGuard } from './jwtrefresh-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  private httpSecure: false;
  constructor(private authService: AuthService) {
    // TODO: When UAT uses SSL
    // this.httpSecure = process.env.NODE_ENV === 'production';
  }

  @ApiBody({ type: LoginRequestDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: UserRequest, @Response() res): Promise<void> {
    const token = await this.authService.login(req.user, true);
    const expTime = new Date(new Date().getTime() + 1 * 55 * 60000); // FE will seek to refresh 5 minutes before expiry time
    res.cookie('access-cookie', token, {
      httpOnly: true,
      secure: this.httpSecure,
      expires: new Date(new Date().getTime() + 48 * 60 * 60000),
    });
    res.send({ message: 'success', expires: expTime });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Response() res): Promise<void> {
    res.clearCookie('access-cookie', { httpOnly: true });
    res.send({ message: 'success' });
  }

  @ApiCookieAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: UserRequest, @Response() res): Promise<void> {
    const token = await this.authService.login(req.user, false);
    const expTime = new Date(new Date().getTime() + 1 * 55 * 60000);
    res.cookie(
      'access-cookie',
      {
        access_token: token.access_token,
        refresh_token: req.cookies['access-cookie'].refresh_token,
      },
      {
        httpOnly: true,
        secure: this.httpSecure,
        expires: new Date(new Date().getTime() + 48 * 60 * 60000),
      },
    );
    res.send({ message: 'success', expires: expTime });
  }
}
