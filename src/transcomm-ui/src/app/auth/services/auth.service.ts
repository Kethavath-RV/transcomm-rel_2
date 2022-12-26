import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, first, switchMap, take, tap } from 'rxjs/operators';

import { UserRole } from 'core/viewEnums';
import { UserResponse, RefreshDto } from 'core/viewModels';
import { LoginResponse, UserLogin } from '../../models/auth.interface';
import { Routerlinks } from '../router-links';
import { SessionStorageService } from './session/session-storage.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  token!: LoginResponse;
  redirectUrl!: string;
  endpoint = '/api/auth';
  public loginSuccessful$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private readonly session: SessionStorageService,
  ) {}
  /**
   *
   * Sends login request to backend and fetches user profile on success.
   */
  login(user: UserLogin): void {
    this.http
      .post(`${this.endpoint}/login`, user, httpOptions)
      .pipe(
        take(1),
        switchMap((response: LoginResponse) => {
          this.session.setTokenExpires(response.expires);
          return this.fetchUserProfile();
        }),
        catchError(() => {
          return of(false);
        }),
      )
      .subscribe((response: boolean | UserResponse) => {
        if (response) {
          this.setRedirectUrl('');
          this.reroute();
          this.loginSuccessful$.next(true);
        } else {
          this.loginSuccessful$.next(false);
        }
      });
  }

  refreshToken(): Observable<RefreshDto> {
    return this.http
      .post<RefreshDto>(`${this.endpoint}/refresh`, {}, httpOptions)
      .pipe(
        take(1),
        tap((res: LoginResponse) => this.session.setTokenExpires(res.expires)),
      );
  }

  logout(shouldNavigate = true): void {
    this.http
      .post<RefreshDto>(`${this.endpoint}/logout`, {}, httpOptions)
      .pipe(
        first(),
        catchError(() => of(null)),
      )
      .subscribe(() => this.resetUserSession(shouldNavigate));
  }

  fetchUserProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`/api/users/current`).pipe(
      take(1),
      tap((res) => this.session.setUserProfile(res)),
      catchError(() => of(null)),
    );
  }

  resetUserSession(shouldNavigate = true): void {
    this.session.clearSession();
    this.redirectUrl = '';
    this.loginSuccessful$.next(false);
    if (shouldNavigate) {
      this.router.navigate([Routerlinks.login]);
    }
  }

  isLoggedIn(): boolean {
    return (
      this.session.get('id') !== null &&
      this.session.get('exp') !== null &&
      this.isTokenValid()
    );
  }

  shouldAttemptRefresh(): boolean {
    return (
      this.session.get('id') !== null &&
      this.session.get('exp') !== null &&
      !this.isTokenValid()
    );
  }

  reroute(): void {
    const user = this.session.getUserProfile();
    if (user.id) {
      if (this.redirectUrl) {
        this.router.navigate([`/${this.redirectUrl}`]);
      } else {
        this.routeAccordingToUserRole(user.role);
      }
    }
  }

  setRedirectUrl(url: string): void {
    if (
      !url ||
      [
        Routerlinks.users,
        Routerlinks.superPassword,
        Routerlinks.login,
      ].includes(url)
    ) {
      this.redirectUrl = '';
    } else {
      this.redirectUrl = url;
    }
  }

  getLoginUrlTree(): UrlTree {
    return this.router.createUrlTree([Routerlinks.login], {
      fragment: this.redirectUrl,
    });
  }

  routeToLogin(): void {
    this.loginSuccessful$.next(false);
    this.router.navigateByUrl(this.getLoginUrlTree());
  }

  isTokenValid(): boolean {
    return this.session.getExpirationDate() > new Date();
  }

  getRerouteUrlTree(targetRoute = ''): UrlTree | boolean {
    const user = this.session.getUserProfile();
    if (user.id) {
      this.loginSuccessful$.next(true);
      if (this.redirectUrl) {
        return this.router.parseUrl(`/${this.redirectUrl}`);
      } else {
        return this.getRoleBasedUrlTree(user.role, targetRoute);
      }
    }
    return this.getLoginUrlTree();
  }

  private getRoleBasedUrlTree(
    role: UserRole,
    targetRoute: string,
  ): UrlTree | boolean {
    switch (role) {
      case 'super_admin':
        return (
          targetRoute === Routerlinks.superPassword ||
          this.router.parseUrl(`/${Routerlinks.superPassword}`)
        );
      case 'admin':
        return (
          targetRoute === Routerlinks.users ||
          this.router.parseUrl(`/${Routerlinks.users}`)
        );
      default:
        return (
          targetRoute === Routerlinks.exceptions ||
          this.router.parseUrl(`/${Routerlinks.exceptions}`)
        );
    }
  }

  private routeAccordingToUserRole(role: UserRole): void {
    switch (role) {
      case 'super_admin':
        this.router.navigate([Routerlinks.superPassword]);
        break;
      case 'admin':
        this.router.navigate([Routerlinks.users]);
        break;
      default:
        this.router.navigate([Routerlinks.exceptions]);
        break;
    }
  }
}
