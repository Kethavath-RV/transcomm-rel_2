import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mockedUserResponseArray } from '../../mocks/data/mockedUserData';
import { MockSessionStorageService } from '../../testing';
import { SessionStorageService } from '../auth/services/session/session-storage.service';
import { StartUpService } from './start-up.service';

describe('StartUpService', () => {
  let service: StartUpService;
  let session: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        { provide: SessionStorageService, useClass: MockSessionStorageService },
      ],
    });
    session = TestBed.inject(SessionStorageService);
    service = TestBed.inject(StartUpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserProfile', () => {
    it('calls current route', (done) => {
      service.getUserProfile().subscribe((val) => {
        expect(val).toEqual(mockedUserResponseArray[0]);
        done();
      });
    });
    it('calls set user profile', (done) => {
      const sessionSpy = jest.spyOn(session, 'setUserProfile');

      service.getUserProfile().subscribe((val) => {
        expect(sessionSpy).toBeCalledWith(val);
        done();
      });
    });
  });
});
