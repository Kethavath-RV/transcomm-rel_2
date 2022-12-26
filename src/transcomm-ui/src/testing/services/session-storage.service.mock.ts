/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { UserResponse } from 'core/viewModels';
import { SessionStorageModel } from '../../app/auth/services/session/session-storage.model';
import { SessionStorageService } from '../../app/auth/services/session/session-storage.service';

const mockSession: SessionStorageModel = new SessionStorageModel();

export class MockSessionStorageService implements SessionStorageService {
  public set(_key: string, _value: string): void {
    return;
  }

  session: SessionStorageModel = new SessionStorageModel();

  get(key: string): string | null {
    return mockSession[key];
  }
  remove(_key: string): void {
    return;
  }
  clear(): void {
    return;
  }

  getFullName(): string {
    return 'a b';
  }

  setUserProfile(_profile: UserResponse): void {
    return;
  }

  getUserProfile(): UserResponse {
    return {
      id: '1234',
      email: 'a@b.com',
      firstName: 'a',
      lastName: 'b',
      locked: false,
      role: 'viewer',
    };
  }
  setTokenExpires(_exp: Date): void {
    return;
  }

  getExpirationDate(): Date {
    return new Date(this.get('exp') ?? new Date());
  }

  clearSession(): void {
    return;
  }
}
