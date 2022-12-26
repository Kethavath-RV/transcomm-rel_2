import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponse } from 'core/viewModels';
import { Observable } from 'rxjs';
import { NewUserRequest } from '../models/helper-models';
import { AbstractRestService } from './AbstractRest.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class UsersService extends AbstractRestService<
  UserResponse,
  UserResponse // RJ - types here need work
> {
  constructor(http: HttpClient) {
    super(http);
  }
  public baseUrl = '/api/users';
  public endpoint = '';

  register(newUser: NewUserRequest): Observable<UserResponse> {
    const endpoint = `${this.baseUrl}/register`;
    return this.http.post<UserResponse>(endpoint, newUser, httpOptions);
  }

  delete(id: string): Observable<UserResponse> {
    const endpoint = `${this.baseUrl}/${id}`;
    return this.http.delete<UserResponse>(endpoint);
  }

  put(user: NewUserRequest): Observable<UserResponse> {
    const endpoint = `${this.baseUrl}`;
    return this.http.put<UserResponse>(endpoint, user, httpOptions);
  }

  changePassword(payload: {
    id: string;
    password: string;
  }): Observable<UserResponse> {
    const endpoint = `${this.baseUrl}/password`;
    return this.http.put<UserResponse>(endpoint, payload, httpOptions);
  }
}
