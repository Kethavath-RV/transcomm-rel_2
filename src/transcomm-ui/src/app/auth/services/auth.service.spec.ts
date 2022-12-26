import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { skip } from 'rxjs/operators';
import { mockedUserResponseArray } from '../../../mocks/data/mockedUserData';
import { MockSessionStorageService } from '../../../testing';
import { UserLogin } from '../../models/auth.interface';
import { Routerlinks } from '../router-links';
import { AuthService } from './auth.service';
import { SessionStorageService } from './session/session-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let session: SessionStorageService;
  let fetchUserProfileSpy: jest.SpyInstance<any>;
  let setTokenExpiresSpy: jest.SpyInstance<any>;
  let setRedirectUrlSpy: jest.SpyInstance<any>;
  let resetUserSessionSpy: jest.SpyInstance<any>;
  let rerouteSpy: jest.SpyInstance<any>;
  let getUserProfileSpy: jest.SpyInstance<any>;
  let routerSpy: jest.SpyInstance<any>;

  let router: Router;

  let user = mockedUserResponseArray[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: SessionStorageService,
          useClass: MockSessionStorageService,
        },
      ],
    });
    service = TestBed.inject(AuthService);
    session = TestBed.inject(SessionStorageService);
    router = TestBed.inject(Router);

    fetchUserProfileSpy = jest.spyOn(service, 'fetchUserProfile');
    setTokenExpiresSpy = jest.spyOn(session, 'setTokenExpires');
    setRedirectUrlSpy = jest.spyOn(service, 'setRedirectUrl');
    rerouteSpy = jest.spyOn(service, 'reroute');
    resetUserSessionSpy = jest.spyOn(service, 'resetUserSession');
    getUserProfileSpy = jest.spyOn(session, 'getUserProfile');
    routerSpy = jest.spyOn(router, 'navigate');
    routerSpy.mockImplementation((val: any[]) => {return});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    const loginCredentials: UserLogin = {
      email: user.email,
      password: 'randoPassword',
    };
    beforeEach(() => {
      fetchUserProfileSpy.mockReturnValue(of(user));
    });
    it('logs in', (done) => {
      const setRedirectUrlSpy = jest
        .spyOn(service, 'setRedirectUrl')
        .mockImplementation();
      const rerouteSpy = jest.spyOn(service, 'reroute').mockImplementation();

      service.login(loginCredentials);

      service.loginSuccessful$
        .pipe(
          skip(1), // Skip is needed as initialised with a false
        )
        .subscribe((val) => {
          expect(val).toEqual(true);
          expect(setTokenExpiresSpy).toHaveBeenCalled();

          expect(setRedirectUrlSpy).toBeCalledWith('');
          expect(rerouteSpy).toBeCalled();
          done();
        });
    });
    it('fails to login on bad credentials', (done) => {
      service.login({ email: 'doesnotexist', password: 'notvalid' });

      service.loginSuccessful$
        .pipe(
          skip(1), // Skip is needed as initialised with a false
        )
        .subscribe((val) => {
          expect(val).toEqual(false);
          done();
        });
    });
  });
  describe('refreshtoken', () => {
    it('refreshes token ', (done) => {
      service.refreshToken().subscribe((_res) => {
        expect(setTokenExpiresSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('logout', () => {
    it('logs out when called with navigation', (done) => {
      resetUserSessionSpy.mockImplementation((val) => {
        // This is enough to test the correct method is called by the logic
        expect(val).toEqual(true);
        done();
      });
      service.logout(true);
    });
    it('logs out when called without navigation', (done) => {
      resetUserSessionSpy.mockImplementation((val) => {
        expect(val).toEqual(false);
        done();
      });
      service.logout(false);
    });
  });
  describe('fetchUserProfile', () => {
    it('gets the current user profile', (done) => {
      const setUserProfileSpy = jest.spyOn(session, 'setUserProfile');
      service.fetchUserProfile().subscribe((res) => {
        expect(res).toEqual(user);
        expect(setUserProfileSpy).toBeCalledWith(res);
        done();
      });
    });
    // can we run a fail case here?
  });
  describe('resetUserSession', () => {
    it('Clears the session updates behaviour subject', (done) => {
      const clearSessionSpy = jest.spyOn(session, 'clearSession');
      service.resetUserSession(false);

      service.loginSuccessful$.subscribe((res) => {
        expect(res).toEqual(false);
        expect(clearSessionSpy).toHaveBeenCalled();
        expect(service.redirectUrl).toEqual('');
        expect(routerSpy).not.toHaveBeenCalled();
        done();
      });
    });
    it('navigates when true', () => {
      service.resetUserSession(true);

      expect(routerSpy).toHaveBeenCalledWith([Routerlinks.login]);
    });
  });
  describe('isLoggedIn', () => {
    it('Returns false if id is null', () => {
      const returnValue = service.isLoggedIn();

      expect(returnValue).toEqual(false);
    });
    it('Returns false if exp is null', () => {
      jest.spyOn(session, 'get').mockImplementation((val) => {
        if (val === 'exp') return null;
      });

      const returnValue = service.isLoggedIn();

      expect(returnValue).toEqual(false);
    });
    it('Returns false if token is not valid', () => {
      jest.spyOn(session, 'get').mockReturnValue('');
      jest.spyOn(service, 'isTokenValid').mockReturnValue(false);
      const returnValue = service.isLoggedIn();

      expect(returnValue).toEqual(false);
    });
    it('Returns true if all are true ', () => {
      jest.spyOn(session, 'get').mockReturnValue('');
      jest.spyOn(service, 'isTokenValid').mockReturnValue(true);
      const returnValue = service.isLoggedIn();

      expect(returnValue).toEqual(true);
    });
  });

  describe('shouldAttemptRefresh', () => {
    it('Returns false if id is null', () => {
      const returnValue = service.shouldAttemptRefresh();

      expect(returnValue).toEqual(false);
    });
    it('Returns false if exp is null', () => {
      jest.spyOn(session, 'get').mockImplementation((val) => {
        if (val === 'exp') return null;
      });

      const returnValue = service.shouldAttemptRefresh();

      expect(returnValue).toEqual(false);
    });
    it('Returns true if token is not valid', () => {
      jest.spyOn(session, 'get').mockReturnValue('');
      jest.spyOn(service, 'isTokenValid').mockReturnValue(false);
      const returnValue = service.shouldAttemptRefresh();

      expect(returnValue).toEqual(true);
    });
    it('Returns false if all are true ', () => {
      jest.spyOn(session, 'get').mockReturnValue('');
      jest.spyOn(service, 'isTokenValid').mockReturnValue(true);
      const returnValue = service.shouldAttemptRefresh();

      expect(returnValue).toEqual(false);
    });
  });
  describe('reroute', () => {
    describe('no fixed redirect', () => {
      it('Does nothing if id is null', () => {
        user.id = null;
        getUserProfileSpy.mockReturnValue(user);

        service.reroute();
        expect(routerSpy).not.toHaveBeenCalled();
      });

      it('Routes to superpassword for superadmin', () => {
        user.id = '123';
        user.role = 'super_admin';
        getUserProfileSpy.mockReturnValue(user);

        service.reroute();
        expect(routerSpy).toHaveBeenCalledWith([Routerlinks.superPassword]);
      });
      it('Routes to users for admin', () => {
        user.role = 'admin';
        getUserProfileSpy.mockReturnValue(user);

        service.reroute();
        expect(routerSpy).toHaveBeenCalledWith([Routerlinks.users]);
      });
      it('Routes to exceptions for users', () => {
        user.role = 'editor';
        getUserProfileSpy.mockReturnValue(user);

        service.reroute();
        expect(routerSpy).toHaveBeenCalledWith([Routerlinks.exceptions]);
      });
    });
    describe('route according to redirecturl', () => {
      it('redirects using redirect url', () => {
        const newRedirectUrl = 'go-here';
        service.redirectUrl = newRedirectUrl;

        service.reroute();

        expect(routerSpy).toHaveBeenCalledWith([`/${newRedirectUrl}`]);
      });
    });
  });

  describe('setRedirectUrl', () => {
    it('sets redirect url', () => {
      const newUrl = 'thisIsTheNewEndpoint';
      service.setRedirectUrl(newUrl);
      expect(service.redirectUrl).toEqual(newUrl);
    });
    it('sets redirect url to empty string', () => {
      const newUrl = null;
      service.setRedirectUrl(newUrl);
      expect(service.redirectUrl).toEqual('');
    });
    describe('routing according to userrole', () => {
      it('sets blank url when routing to users', () => {
        const newUrl = Routerlinks.users;
        service.setRedirectUrl(newUrl);
        expect(service.redirectUrl).toEqual('');
      });
      it('sets blank url when routing to superpassword', () => {
        const newUrl = Routerlinks.superPassword;
        service.setRedirectUrl(newUrl);
        expect(service.redirectUrl).toEqual('');
      });
      it('sets blank url when routing to login', () => {
        const newUrl = Routerlinks.login;
        service.setRedirectUrl(newUrl);
        expect(service.redirectUrl).toEqual('');
      });
    });
  });
  describe('getLoginUrlTree', () => {
    it('should use the router to create a tree', () => {
      const urlTreeSpy = jest.spyOn(router, 'createUrlTree');
      service.getLoginUrlTree();
      expect(urlTreeSpy).toHaveBeenCalled();
    });
  });
  describe('getLoginUrlTree', () => {
    //This test is not great. trusting  the router to handle it
    it('should use the router to create a tree', () => {
      const urlTreeSpy = jest.spyOn(router, 'createUrlTree');
      service.getLoginUrlTree();
      expect(urlTreeSpy).toHaveBeenCalled();
    });
  });
  describe('routetoLogin', () => {
    it('should trigger the login behavour subject', (done) => {
      service.loginSuccessful$.subscribe((val) => {
        expect(val).toEqual(false);
        done();
      });
    });
    it('should navigate to login', () => {
      const urlTree = new UrlTree();
      const routerNavigateByUrlSpy = jest
        .spyOn(router, 'navigateByUrl')
        .mockImplementation((_urlTree: UrlTree) => {
          return null;
        });
      jest.spyOn(service, 'getLoginUrlTree').mockReturnValue(urlTree);
      service.routeToLogin();
      expect(routerNavigateByUrlSpy).toBeCalledWith(urlTree);
    });
  });
  describe('istokenValid', () => {
    it('return true when valid', () => {
      const tomorrow = ((d) => new Date(d.setDate(d.getDate() + 1)))(
        new Date(),
      );
      jest.spyOn(session, 'getExpirationDate').mockReturnValue(tomorrow);
      const returnValue = service.isTokenValid();
      expect(returnValue).toEqual(true);
    });
    it('return false when invalid', () => {
      const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(
        new Date(),
      );
      jest.spyOn(session, 'getExpirationDate').mockReturnValue(yesterday);
      const returnValue = service.isTokenValid();
      expect(returnValue).toEqual(false);
    });
  });
  describe('getRerouteUrlTree', () => {
    describe('not logged in', () => {
      it('returns login route', () => {
        getUserProfileSpy.mockImplementation(() => {
          user = mockedUserResponseArray[0];
          user.id = '';
          return user;
        });
        const urlTree = new UrlTree();
        jest.spyOn(service, 'getLoginUrlTree').mockImplementation(() => {
          return urlTree;
        });
        const returnValue = service.getRerouteUrlTree();

        expect(returnValue).toEqual(urlTree);
      });
    });
    describe('logged in', () => {
      it('triggers the behaviour subject', (done) => {
        user.id = '123';
        getUserProfileSpy.mockReturnValue(user);
        service.getRerouteUrlTree();

        service.loginSuccessful$.subscribe((val) => {
          expect(val).toEqual(true);
          done();
        });
      });
      it('returns redirect tree when set', () => {
        user.id = '123';
        getUserProfileSpy.mockReturnValue(user);
        const redirectUrl = 'redirecthere';
        const urlTree = new UrlTree();
        const routerParseUrl = jest
          .spyOn(router, 'parseUrl')
          .mockReturnValue(urlTree);
        service.redirectUrl = redirectUrl;

        const returnValue = service.getRerouteUrlTree();

        expect(routerParseUrl).toBeCalledWith(`/${redirectUrl}`);
        expect(returnValue).toEqual(urlTree);
      });
      describe('reroute by userrole', () => {
        it('redirects by superadmin', () => {
          user.id = '123';
          user.role = 'super_admin';
          getUserProfileSpy.mockReturnValue(user);
          const redirectUrl = '';
          const urlTree = new UrlTree();
          const routerParseUrl = jest
            .spyOn(router, 'parseUrl')
            .mockReturnValue(urlTree);
          service.redirectUrl = redirectUrl;

          const returnValue = service.getRerouteUrlTree();

          expect(routerParseUrl).toBeCalledWith(
            `/${Routerlinks.superPassword}`,
          );
          expect(returnValue).toEqual(urlTree);
        });
        it('redirects by admin', () => {
          user.id = '123';
          user.role = 'admin';
          getUserProfileSpy.mockReturnValue(user);
          const redirectUrl = '';
          const urlTree = new UrlTree();
          const routerParseUrl = jest
            .spyOn(router, 'parseUrl')
            .mockReturnValue(urlTree);
          service.redirectUrl = redirectUrl;

          const returnValue = service.getRerouteUrlTree();

          expect(routerParseUrl).toBeCalledWith(`/${Routerlinks.users}`);
          expect(returnValue).toEqual(urlTree);
        });
        it('redirects by users', () => {
          user.id = '123';
          user.role = 'editor';
          getUserProfileSpy.mockReturnValue(user);
          const redirectUrl = '';
          const urlTree = new UrlTree();
          const routerParseUrl = jest
            .spyOn(router, 'parseUrl')
            .mockReturnValue(urlTree);
          service.redirectUrl = redirectUrl;

          const returnValue = service.getRerouteUrlTree();

          expect(routerParseUrl).toBeCalledWith(`/${Routerlinks.exceptions}`);
          expect(returnValue).toEqual(urlTree);
        });
      });
    });
  });
});
