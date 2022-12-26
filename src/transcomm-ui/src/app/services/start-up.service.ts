import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponse } from 'core/viewModels';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SessionStorageService } from '../auth/services/session/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class StartUpService {
  constructor(
    private http: HttpClient,
    private session: SessionStorageService,
  ) {}

  getUserProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`/api/users/current`).pipe(
      catchError((err) => {
        return of(err);
      }),
      tap((user) => {
        this.session.setUserProfile(user);
      }),
    );
  }
}
