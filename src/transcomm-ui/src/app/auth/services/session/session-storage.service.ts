/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@angular/core';
import { UserRole } from 'core/viewEnums';
import { UserResponse } from 'core/viewModels';
import { strToBool } from '../../../helpers/stringHelpers';

import {
  SessionKeys,
  SessionStorageModel,
  SessionString,
} from './session-storage.model';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  session: SessionStorageModel = new SessionStorageModel();

  public set(key: SessionKeys, value: string) {
    this.session[key] = value ?? '';
  }
  get(key: SessionKeys): SessionString {
    return this.session[key];
  }
  remove(key: SessionKeys) {
    this.session[key] = null;
  }
  clear() {
    this.session = new SessionStorageModel();
  }

  getFullName(): string {
    return `${this.session.firstName} ${this.session.lastName}`;
  }

  setUserProfile(profile: UserResponse): void {
    this.session.id = profile.id;
    this.session.firstName = profile.firstName;
    this.session.lastName = profile.lastName;
    this.session.email = profile.email;
    this.session.role = profile.role;
    this.session.locked = profile.locked ? profile.locked.toString() : null;
  }

  getUserProfile(): UserResponse {
    return {
      id: this.session.id ?? '',
      email: this.session.email ?? '',
      firstName: this.session.firstName ?? '',
      lastName: this.session.lastName ?? '',
      locked: strToBool(this.session.locked ?? true),
      role: (this.session.role ?? '') as UserRole,
    };
  }

  setTokenExpires(exp: Date): void {
    this.set('exp', exp.toString());
  }

  getExpirationDate(): Date {
    return new Date(this.get('exp') ?? new Date());
  }

  clearSession(): void {
    this.session = Object.assign({}, new SessionStorageModel());
  }
}
