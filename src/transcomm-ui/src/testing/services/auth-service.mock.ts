import { UrlTree } from '@angular/router';
import { RefreshDto } from 'core';
import { UserResponse } from 'core/viewModels';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginResponse, UserLogin } from '../../app/models/auth.interface';
import { mockRefreshTokenSuccess } from '../../mocks/data/mockedRefreshToken';
import { mockedUserResponseArray } from '../../mocks/data/mockedUserData';

const userProfile = mockedUserResponseArray[0];

export class MockAuthService {
  token!: LoginResponse;
  redirectUrl!: string;
  endpoint = '/api/auth';
  public loginSuccessful$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  login(_user: UserLogin) {
    return;
  }
  refreshToken(): Observable<RefreshDto> {
    return of(mockRefreshTokenSuccess);
  }
  logout(_shouldNavigate) {
    return;
  }
  fetchUserProfile(): Observable<UserResponse> {
    return of(userProfile);
  }
  resetUserSession(_shouldNavigate) {
    return;
  }

  isLoggedIn(): boolean {
    return false;
  }

  reroute(_shouldDispatch = false): void {
    return;
  }

  setRedirectUrl(_url: string): void {
    return;
  }

  getLoginUrlTree(): UrlTree {
    return null;
  }
  routeToLogin(): void {
    return;
  }

  isTokenValid(): boolean {
    return null;
  }
  getRerouteUrlTree(_targetRoute = ''): UrlTree | boolean {
    return null;
  }
}
