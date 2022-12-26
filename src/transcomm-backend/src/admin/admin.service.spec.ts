import { Test, TestingModule } from '@nestjs/testing';
import { SecretsResponse } from 'core';
import { mock, MockProxy } from 'jest-mock-extended';
import { DatagenClient } from '../datagen-client/datagen-client';
import { AdminService } from './admin.service';

export type Context = {
  datagenClient: DatagenClient;
};

export type MockContext = {
  datagenClient: MockProxy<DatagenClient>;
};

export const createMockContext = (): MockContext => {
  return {
    datagenClient: mock<DatagenClient>(),
  };
};

export const secretsResponse: SecretsResponse = {
  success: true,
  message: 'Datagen has successfully fetched latest secrets from vault',
};

describe('AdminService', () => {
  let service: AdminService;
  let context: MockContext;

  beforeEach(async () => {
    context = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: DatagenClient,
          useValue: context.datagenClient,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return success if update was successful', async () => {
    const invokeUpdateSecrets =
      context.datagenClient.invokeUpdateSecrets.mockResolvedValue(
        secretsResponse,
      );
    const result = await service.updateSecrets();
    expect(invokeUpdateSecrets).toBeCalledTimes(1);
    expect(result).toStrictEqual(secretsResponse);
  });

  it('should return failure if update was not successful', async () => {
    secretsResponse.success = false;
    secretsResponse.message =
      'Unable to fetch latest secrets due to issues with vault';
    const invokeUpdateSecrets =
      context.datagenClient.invokeUpdateSecrets.mockResolvedValue(
        secretsResponse,
      );
    const result = await service.updateSecrets();
    expect(invokeUpdateSecrets).toBeCalledTimes(1);
    expect(result).toStrictEqual(secretsResponse);
  });

  it('should return failure if error was thrown', async () => {
    secretsResponse.success = false;
    secretsResponse.message =
      'Unable to fetch latest secrets due to issues with datagen';
    const invokeUpdateSecrets =
      context.datagenClient.invokeUpdateSecrets.mockImplementation(() => {
        throw new Error();
      });
    const result = await service.updateSecrets();
    expect(invokeUpdateSecrets).toBeCalledTimes(1);
    expect(result).toStrictEqual(secretsResponse);
  });
});
