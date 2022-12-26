import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthHyperledgerResponse } from 'core';
import { of } from 'rxjs';
import { HyperledgerAuthenticationService } from './hyperledger-authentication.service';

const mockHttpService = () => ({
  post: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

let httpService;

let authHyperledgerResponse: AuthHyperledgerResponse;

describe('HyperledgerAuthenticationService', () => {
  let service: HyperledgerAuthenticationService;
  let configService;

  beforeEach(async () => {
    authHyperledgerResponse = {
      message: { response: 'success', token: 'hash' },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HyperledgerAuthenticationService,
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: HttpService, useFactory: mockHttpService },
      ],
    }).compile();

    service = module.get<HyperledgerAuthenticationService>(
      HyperledgerAuthenticationService,
    );
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('it returns a token if the authentication is succesful', async () => {
    service.clearToken();
    const mockResponse = of({
      data: authHyperledgerResponse,
    });
    configService.get.mockReturnValue('test');
    httpService.post.mockReturnValue(mockResponse);

    await expect(service.getAuthenticationToken()).resolves.toEqual('hash');
    expect(httpService.post).toBeCalledTimes(1);
  });

  it('it returns the same token if there is already one', async () => {
    service.clearToken();
    const mockResponse = of({
      data: authHyperledgerResponse,
    });
    configService.get.mockReturnValue('test');
    httpService.post.mockReturnValue(mockResponse);

    await expect(service.getAuthenticationToken()).resolves.toEqual('hash');
    expect(httpService.post).toBeCalledTimes(1);
    jest.clearAllMocks();
    await expect(service.getAuthenticationToken()).resolves.toEqual('hash');
    expect(httpService.post).not.toBeCalled();
  });
});
