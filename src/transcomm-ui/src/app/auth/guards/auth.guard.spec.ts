import { TestBed } from '@angular/core/testing';
import { UrlTree } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { mockUserResponseData } from '../../../testing';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

jest.mock('../services/auth.service');

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let service: AuthService;

  let isLoggedInSpy: jest.SpyInstance<any>;
  let getRerouteUrlTreeSpy: jest.SpyInstance<any>;

  let shouldAttemptRefreshSpy: jest.SpyInstance<any>;
  let fetchUserProfileSpy: jest.SpyInstance<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, AuthService],
    });
    service = TestBed.inject(AuthService);
    guard = TestBed.inject(AuthGuard);

    isLoggedInSpy = jest.spyOn(service, 'isLoggedIn');
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      getRerouteUrlTreeSpy = jest.spyOn(service, 'getRerouteUrlTree');
    });

    it('returns reroute if logged in', () => {
      const mockUrlTree = new UrlTree();
      getRerouteUrlTreeSpy.mockReturnValue(mockUrlTree);

      isLoggedInSpy.mockImplementation(() => true);
      const returnValue = guard.canActivate();

      expect(isLoggedInSpy).toHaveBeenCalled();
      expect(returnValue).toEqual(mockUrlTree);
    });

    it('returns true if not logged in', () => {
      isLoggedInSpy.mockReturnValue(false);

      const returnValue = guard.canActivate();

      expect(isLoggedInSpy).toBeCalled();
      expect(getRerouteUrlTreeSpy).not.toBeCalled();
      expect(returnValue).toEqual(true);
    });
  });

  describe('canLoad', () => {
    beforeEach(() => {
      shouldAttemptRefreshSpy = jest.spyOn(service, 'shouldAttemptRefresh');
      fetchUserProfileSpy = jest.spyOn(service, 'fetchUserProfile');

      service.loginSuccessful$ = new BehaviorSubject<boolean>(false);
    });

    describe('true', () => {
      it('returns true if logged in', (done) => {
        isLoggedInSpy.mockReturnValue(true);

        const returnValue = guard.canLoad();

        expect(isLoggedInSpy).toBeCalled();
        expect(shouldAttemptRefreshSpy).not.toBeCalled();

        returnValue.subscribe((val) => {
          expect(val).toEqual(true);
        });

        service.loginSuccessful$.subscribe((val) => {
          expect(val).toEqual(true);
          done();
        });
      });
      it('returns true if profile exists', (done) => {
        isLoggedInSpy.mockReturnValue(false);
        shouldAttemptRefreshSpy.mockReturnValue(true);
        fetchUserProfileSpy.mockReturnValue(of(mockUserResponseData[0]));

        const returnValue = guard.canLoad();

        expect(isLoggedInSpy).toBeCalled();

        returnValue.subscribe((val) => {
          expect(val).toEqual(true);
        });

        service.loginSuccessful$.subscribe((val) => {
          expect(val).toEqual(true);
          done();
        });
      });
    });

    describe('false', () => {
      it('returns false if not logged in', (done) => {
        isLoggedInSpy.mockReturnValue(false);
        shouldAttemptRefreshSpy.mockReturnValue(false);

        const returnValue = guard.canLoad();

        returnValue.subscribe((val) => {
          expect(val).toEqual(false);
          done();
        });
      });
      it('returns false if not loggedin and no user', (done) => {
        isLoggedInSpy.mockReturnValue(false);
        shouldAttemptRefreshSpy.mockReturnValue(true);
        fetchUserProfileSpy.mockReturnValue(of(null));

        const returnValue = guard.canLoad();

        returnValue.subscribe((val) => {
          expect(val).toEqual(false);
          done();
        });
      });
      it('returns false if not loggedin and error', (done) => {
        isLoggedInSpy.mockReturnValue(false);
        shouldAttemptRefreshSpy.mockReturnValue(true);
        fetchUserProfileSpy.mockReturnValue(throwError('test'));

        const returnValue = guard.canLoad();

        returnValue.subscribe((val) => {
          expect(val).toEqual(false);
          done();
        });
      });
    });
  });
});
