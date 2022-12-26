import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationRequest, AuthHyperledgerResponse } from 'core';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class HyperledgerAuthenticationService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  private authenticationToken: string | null;

  clearToken(): void {
    this.authenticationToken = null;
  }

  getAuthenticationToken(): Promise<string> {
    if (this.authenticationToken) {
      this.logger.debug('get authentication token from memory');
      return Promise.resolve(this.authenticationToken);
    } else {
      this.logger.debug('requesting new authentication token');
      return this.authenticate();
    }
  }

  private async authenticate(): Promise<string> {
    this.logger.log('Authenticating with hyperledger');
    const hyperledgerClientId = this.configService.get('HYPERLEDGER_CLIENT_ID');
    if (!hyperledgerClientId) {
      throw new Error('HYPERLEDGER_CLIENT_ID environment variable not found');
    }
    const formBody = this.createAuthenticateFormBody(hyperledgerClientId);
    const result = this.httpService
      .post<AuthHyperledgerResponse>('/client/authenticate', formBody)
      .pipe(
        map((response) => response.data),
        map((data) => data.message.token),
      );
    const token = await lastValueFrom(result);
    this.authenticationToken = token;
    return token;
  }

  private createAuthenticateFormBody(clientID: string): string {
    const details: AuthenticationRequest = {
      clientID: clientID,
    };
    return this.createFormEntries(details);
  }

  private createFormEntries<T>(details: T) {
    const formEntries: string[] = [];
    Object.entries(details).forEach(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      if (Array.isArray(value)) {
        value = JSON.stringify(value);
      }
      const encodedValue = encodeURIComponent(value);
      formEntries.push(encodedKey + '=' + encodedValue);
    });

    return formEntries.join('&');
  }
}
