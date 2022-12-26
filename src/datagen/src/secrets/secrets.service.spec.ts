import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { VAULT_CONNECTION } from 'nest-vault';
import { SecretsService } from './secrets.service';

const mockConfig = {
  get: jest.fn((_key: string) => {
    return 'mockString';
  }),
};

const mockVault = {
  readKVSecret: jest.fn(),
  loginWithUserpass: jest.fn(),
};

describe('SecretsService', () => {
  let service: SecretsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretsService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: VAULT_CONNECTION, useValue: mockVault },
      ],
    }).compile();

    service = module.get<SecretsService>(SecretsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch secrets from HashiCorp Vault', async () => {
    const loginWithUserpass = mockVault.loginWithUserpass.mockResolvedValue({
      client_token: 'mockToken',
    });
    const readKVSecret = mockVault.readKVSecret.mockResolvedValue({
      data: {
        mockSecret: 'base64EncodedMockSecrets',
      },
    });
    const result = await service.fetchSecretsFromHashiCorpVault();
    expect(loginWithUserpass).toBeCalledTimes(1);
    expect(readKVSecret).toBeCalledTimes(1);
    // Ensure method does not return secrets
    expect(result).toBe(undefined);
  });

  it('should throw error if failed to authenticate with HashiCorp Vault', async () => {
    const loginWithUserpass = mockVault.loginWithUserpass.mockImplementation(
      () => {
        throw new Error('MockAuthError');
      },
    );
    const readKVSecret = mockVault.readKVSecret.mockResolvedValue({
      mockSecret: 'mockSecrets',
    });
    await expect(service.fetchSecretsFromHashiCorpVault()).rejects.toThrowError(
      new Error('MockAuthError'),
    );
    expect(loginWithUserpass).toBeCalledTimes(1);
    expect(readKVSecret).toBeCalledTimes(0);
  });

  it('should throw error if failed to fetch secrets from HashiCorp Vault', async () => {
    const loginWithUserpass = mockVault.loginWithUserpass.mockResolvedValue({
      client_token: 'mockToken',
    });
    const readKVSecret = mockVault.readKVSecret.mockImplementation(() => {
      throw new Error('MockFetchError');
    });
    await expect(service.fetchSecretsFromHashiCorpVault()).rejects.toThrowError(
      new Error('MockFetchError'),
    );
    expect(loginWithUserpass).toBeCalledTimes(1);
    expect(readKVSecret).toBeCalledTimes(1);
  });
});
