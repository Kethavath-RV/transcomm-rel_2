/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RefreshDto } from 'core/viewModels';
import { identity, Observable, of, throwError } from 'rxjs';
import { catchError, first, retry, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private prevReq = '';
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return this.handleRequest(request, next);
  }

  private handleRequest(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const handler = next.handle(request).pipe(
      this.isNotAuthRoute([request.url]) ? retry(1) : identity,
      catchError((error): Observable<any> => this.parseError(error, request)),
      tap(() => (this.prevReq = request.url)),
    );
    // if trying to access sensitive endpoints without a valid token and not even refreshing rn
    if (
      !this.authService.isTokenValid() &&
      this.isNotAuthRoute([request.url, this.prevReq]) &&
      !this.isRefreshing
    ) {
      return this.attemptRefresh().pipe(
        take(1),
        tap((res: RefreshDto) => {
          this.isRefreshing = false;

          if (res?.refreshFailed) {
            if (this.prevReq !== '/api/auth/refresh') {
              this.authService.routeToLogin();
            } else {
              this.authService.logout(false);
            }
          }
        }),
        switchMap((val) => {
          if (val?.refreshFailed) {
            return throwError(val);
          }
          return handler;
        }),
      );
    }
    // otherwise ure good
    return handler;
  }

  private attemptRefresh(): Observable<any> {
    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      first(),
      catchError(() => of({ refreshFailed: true })),
    );
  }

  isNotAuthRoute(urls: string[]): boolean {
    return urls.some((url) => {
      return ![
        '/api/users/current',
        '/api/auth/refresh',
        '/api/auth/login',
        '/api/auth/logout',
      ].includes(url);
    });
  }

  private parseError(
    error: Observable<any>,
    request: HttpRequest<any>,
  ): Observable<any> {
    if (request.url === '/api/auth/logout') {
      this.authService.resetUserSession();
      return of(true);
    }
    if (error instanceof HttpErrorResponse) {
      if (String(error.status)[0] === '5') {
        return throwError(serverError);
      } else if (error.status === 401) {
        if (this.isNotAuthRoute([request.url])) {
          this.authService.resetUserSession();
        }
        return throwError(unauthorizedError);
      } else {
        return throwError(error);
      }
    }
  }
}

const unauthorizedError = {
  status: 401,
  message: 'unauthorized',
};

const serverError = {
  status: 500,
  message: 'system is down',
};
