import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, UrlTree } from '@angular/router';
import { UserResponse } from 'core/viewModels';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return this.authService.getRerouteUrlTree();
    }
    return true;
  }

  canLoad(): Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      this.authService.loginSuccessful$.next(true);
      return of(true);
    }
    if (this.authService.shouldAttemptRefresh()) {
      return this.authService.fetchUserProfile().pipe(
        take(1),
        catchError(() => {
          return of(false);
        }),
        map((userResp: UserResponse | boolean) => {
          if (userResp) {
            this.authService.loginSuccessful$.next(true);
            return true;
          }
          return false;
        }),
      );
    }
    return of(false);
  }
}
