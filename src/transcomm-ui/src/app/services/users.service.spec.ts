import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UserResponse } from 'core/viewModels';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  mockedExistingNewUserRequest,
  mockedNewNewUserRequest,
  mockedNewNewUserResponse,
  mockedUserResponseArray
} from '../../mocks/data/mockedUserData';
import { UsersService } from './users.service';


describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('variables', () => {
    it('baseUrl should be initialised correctly', () => {
      expect(service.baseUrl).toEqual('/api/users');
    });
    it('endpoint should be initialised correctly', () => {
      expect(service.endpoint).toEqual('');
    });
  });

  describe('register', () => {
    // These need to be made better (fix return val)
    it('should call register with new user', (done) => {
      service.register(mockedNewNewUserRequest).subscribe((res) => {
        expect(res).toEqual(mockedNewNewUserResponse);
        done();
      });
    });

    it('should call register with a repeat user and fail', (done) => {
      service
        .register(mockedExistingNewUserRequest)
        .pipe(
          catchError((err) => {
            return of(err);
          }),
        )
        .subscribe((res) => {
          expect(res.status).toEqual(400);
          expect(res.error.message).toEqual('User already exists');
          done();
        });
    });
  });

  describe('delete', () => {
    it('should call delete and return successfully', (done) => {
      const id = mockedUserResponseArray[0].id;
      service.delete(id).subscribe((res) => {
        expect(res).toEqual(mockedUserResponseArray[0]);
        done();
      });
    });
    it('should call delete and fail with missing user', (done) => {
      const id = 'does not exist';
      service
        .delete(id)
        .pipe(
          catchError((err) => {
            return of(err);
          }),
        )
        .subscribe((res) => {
          expect(res.status).toEqual(404);
          expect(res.error.message).toEqual('User not found');
          done();
        });
    });
  });
  describe('put', () => {
    it('should call put and return successfully', (done) => {
      const user = mockedUserResponseArray[0];
      service.put(user).subscribe((res) => {
        expect(res).toEqual(user);
        done();
      });
    });
    it('should call put and fail with missing user', (done) => {
      const user: UserResponse = mockedNewNewUserResponse;
      service
        .put(user)
        .pipe(
          catchError((err) => {
            return of(err);
          }),
        )
        .subscribe((res) => {
          expect(res.status).toEqual(404);
          expect(res.error.message).toEqual('User not found');
          done();
        });
    });
  });
  describe('changePassword', () => {
    it('should call put and return successfully', (done) => {
      const user = mockedUserResponseArray[0];
      const payload = { id: user.id, password: 'newpassword' };
      service.changePassword(payload).subscribe((res) => {
        expect(res).toEqual(user);
        done();
      });
    });
    it('should call put and fail with missing user', (done) => {
      const user: UserResponse = mockedNewNewUserResponse;
      const payload = { id: user.id, password: 'newpassword' };

      service
        .changePassword(payload)
        .pipe(
          catchError((err) => {
            return of(err);
          }),
        )
        .subscribe((res) => {
          expect(res.status).toEqual(404);
          expect(res.error.message).toEqual('User not found');
          done();
        });
    });
  });
});
