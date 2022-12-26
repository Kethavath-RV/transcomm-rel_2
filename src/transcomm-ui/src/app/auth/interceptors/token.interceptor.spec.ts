import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { catchError, first, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { TokenInterceptor } from './token.interceptor';

jest.mock('../services/auth.service'); // Using an auto mock of auth service

describe('TokenInterceptor', () => {
  let client: HttpClient;
  let controller: HttpTestingController;
  let service: AuthService;

  const testUrl = '/test';
  const logoutRoute = '/api/auth/logout';
  const responseBody = { response: true };

  let isTokenValidSpy: jest.SpyInstance<any>;
  let routeToLoginSpy: jest.SpyInstance<any>;
  let logOutSpy: jest.SpyInstance<any>;
  let refreshTokenSpy: jest.SpyInstance<any>;
  let resetUserSessionSpy: jest.SpyInstance<any>;

  function mockImplementationRefreshCall(
    isSuccess = true,
    errorCode = 401,
  ): Observable<any> {
    // Intention here is to mock a refresh flow, including triggering the interceptor again and setting the token
    const refreshUrl = `/api/auth/refresh`;

    const response = isSuccess
      ? new HttpResponse<any>({ status: 200 })
      : new HttpErrorResponse({ status: errorCode });

    client
      .post(refreshUrl, {}, {})
      .pipe(first())
      .subscribe((res) => {
        expect(res);
      });
    const refreshRequest = controller.expectOne(refreshUrl);

    refreshRequest.flush({}, response);
    isTokenValidSpy.mockReturnValue(isSuccess);

    return isSuccess ? of(response) : throwError(response);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true,
        },
        AuthService,
      ],
    });

    client = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);

    isTokenValidSpy = jest.spyOn(service, 'isTokenValid');
    routeToLoginSpy = jest.spyOn(service, 'routeToLogin');
    logOutSpy = jest.spyOn(service, 'logout');
    refreshTokenSpy = jest.spyOn(service, 'refreshToken');
    resetUserSessionSpy = jest.spyOn(service, 'resetUserSession');
  });

  describe('Requests while logged in', () => {
    describe('Successful requests', () => {
      beforeEach(() => {
        isTokenValidSpy.mockReturnValue(true);
      });

      it('should let normal request through', (done) => {
        client.get(testUrl).subscribe((response) => {
          expect(response).toEqual(responseBody);
          done();
        });

        const request = controller.expectOne(testUrl);
        request.flush(responseBody); // trigger response

        expect(isTokenValidSpy).toHaveBeenCalledTimes(1);
        expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
        expect(logOutSpy).toHaveBeenCalledTimes(0);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(0);
        expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
      });
      it('should let logout request through', (done) => {
        client.get(logoutRoute).subscribe((response) => {
          expect(response).toEqual(responseBody);
          done();
        });

        const request = controller.expectOne(logoutRoute);
        request.flush(responseBody); // trigger response

        expect(isTokenValidSpy).toHaveBeenCalledTimes(1);
        expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
        expect(logOutSpy).toHaveBeenCalledTimes(0);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(0);
        expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('Logged in trying to do unauthorized things', () => {
      beforeEach(() => {
        isTokenValidSpy.mockReturnValue(true);
      });
      it('should send a 401 for unauthorized request', () => {
        client
          .get(testUrl)
          .pipe(
            catchError((err) => {
              expect(err.status).toEqual(401);
              return of(null);
            }),
          )
          .subscribe(() => {
            return;
          });

        // Double response needed for retry mechanism
        const firstRequest = controller.expectOne(testUrl);
        firstRequest.flush({}, new HttpErrorResponse({ status: 401 }));
        const retryRequest = controller.expectOne(testUrl);
        retryRequest.flush({}, new HttpErrorResponse({ status: 401 }));

        expect(isTokenValidSpy).toHaveBeenCalledTimes(1);
        expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
        expect(logOutSpy).toHaveBeenCalledTimes(0);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(0);
        expect(resetUserSessionSpy).toHaveBeenCalledTimes(1);
      });
      it('should handle a not found error', () => {
        client
          .get(testUrl)
          .pipe(
            catchError((err) => {
              expect(err.status).toEqual(404);
              return of(null);
            }),
          )
          .subscribe(() => {
            return;
          });

        // Double response needed for retry mechanism
        const firstRequest = controller.expectOne(testUrl);
        firstRequest.flush({}, new HttpErrorResponse({ status: 404 }));
        const retryRequest = controller.expectOne(testUrl);
        retryRequest.flush({}, new HttpErrorResponse({ status: 404 }));

        expect(isTokenValidSpy).toHaveBeenCalledTimes(1);
        expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
        expect(logOutSpy).toHaveBeenCalledTimes(0);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(0);
        expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('refresh token needed', () => {
      beforeEach(() => {
        isTokenValidSpy.mockReturnValue(false);
        refreshTokenSpy.mockImplementation(() =>
          mockImplementationRefreshCall(true),
        );
      });

      it('should let normal request through', (done) => {
        client.get(testUrl).subscribe((response) => {
          expect(response).toEqual(responseBody);
          done();
        });

        const request = controller.expectOne(testUrl);
        request.flush(responseBody);

        expect(isTokenValidSpy).toHaveBeenCalledTimes(2);
        expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
        expect(logOutSpy).toHaveBeenCalledTimes(0);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
        expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
      });

      it('should let logout request through', (done) => {
        client.get(logoutRoute).subscribe((response) => {
          expect(response).toEqual(responseBody);
          done();
        });

        const request = controller.expectOne(logoutRoute);
        request.flush(responseBody);

        expect(isTokenValidSpy).toHaveBeenCalledTimes(2);
        expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
        expect(logOutSpy).toHaveBeenCalledTimes(0);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
        expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Logged out', () => {
    beforeEach(() => {
      isTokenValidSpy.mockReturnValue(false);
      refreshTokenSpy.mockImplementation(
        () => mockImplementationRefreshCall(false, 401), // not authorized
      );
    });

    it('should return error on normal route', (done) => {
      client
        .get(testUrl)
        .pipe(
          catchError((err) => {
            expect(err).toEqual({ refreshFailed: true });

            done();
            return of(null);
          }),
        )
        .subscribe(() => {
          return;
        });

      controller.expectNone(testUrl); // endpoint is not called when refresh fails

      expect(isTokenValidSpy).toHaveBeenCalledTimes(2);
      expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
      expect(logOutSpy).toHaveBeenCalledTimes(1);
      expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
      expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
    });
  });
  describe('Server is down', () => {
    beforeEach(() => {
      isTokenValidSpy.mockReturnValue(true);
    });

    it('should return error on normal route', (done) => {
      client
        .post(testUrl, {}, {})
        .pipe(
          catchError((err) => {
            expect(err.status).toEqual(500);
            done();
            return of(null);
          }),
        )
        .subscribe(() => {
          return;
        });

      //called twice for normal route
      const firstRequest = controller.expectOne(testUrl);
      firstRequest.flush({}, new HttpErrorResponse({ status: 500 }));
      const retriedRequest = controller.expectOne(testUrl);
      retriedRequest.flush({}, new HttpErrorResponse({ status: 500 }));

      expect(isTokenValidSpy).toHaveBeenCalledTimes(1);
      expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
      expect(logOutSpy).toHaveBeenCalledTimes(0);
      expect(refreshTokenSpy).toHaveBeenCalledTimes(0);
      expect(resetUserSessionSpy).toHaveBeenCalledTimes(0);
    });

    it('should reset user session on logout route', () => {
      // not waiting for response as logout logic triggers
      client.post(logoutRoute, {}, {}).subscribe(() => {
        return;
      });

      const request = controller.expectOne(logoutRoute);
      request.flush({}, new HttpErrorResponse({ status: 500 }));

      expect(isTokenValidSpy).toHaveBeenCalledTimes(1);
      expect(routeToLoginSpy).toHaveBeenCalledTimes(0);
      expect(logOutSpy).toHaveBeenCalledTimes(0);
      expect(refreshTokenSpy).toHaveBeenCalledTimes(0);
      expect(resetUserSessionSpy).toHaveBeenCalledTimes(1);
    });
  });
});
