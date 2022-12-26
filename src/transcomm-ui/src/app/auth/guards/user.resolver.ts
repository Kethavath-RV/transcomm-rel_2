import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { UserResponse } from 'core/viewModels';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Resolver to get the current user before navigating to not-found route.
 * In case no user profile is found, null is returned so that the page component can navigate to login
 **/
@Injectable()
export class UserResolver implements Resolve<UserResponse> {
  constructor(private readonly auth: AuthService) {}
  resolve(): Observable<UserResponse> {
    return this.auth.fetchUserProfile().pipe(
      catchError(() => of(null)),
      map((user) => {
        this.auth.loginSuccessful$.next(user || false);
        return user || null;
      }),
    );
  }
}
