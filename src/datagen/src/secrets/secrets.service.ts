import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VAULT_CONNECTION } from 'nest-vault';
const decodeBase64 = require('atob');

@Injectable()
export class SecretsService implements OnModuleInit {
  constructor(
    @Inject(VAULT_CONNECTION) private readonly vault,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(this.constructor.name);

  private secrets: { [key: string]: string };

  public async fetchSecretsFromHashiCorpVault(): Promise<void | never> {
    const vaultUrl = this.configService.get('HASHICORP_VAULT_URL');
    const secretsAddress = this.configService.get('HASHICORP_SECRET_ADDRESS');
    const username = this.configService.get('HASHICORP_USERNAME');
    const password = this.configService.get('HASHICORP_PASSWORD');
    const rootPath = this.configService.get('HASHICORP_ROOT_PATH');

    this.logger.debug(
      `Fetching secrets from HashiCorp Vault at ${vaultUrl} on address ${secretsAddress}`,
    );
    try {
      const authResponse = await this.vault.loginWithUserpass(
        username,
        password,
      );
      const viewRead = await this.vault.readKVSecret(
        authResponse.client_token,
        secretsAddress,
        '',
        rootPath,
      );
      this.secrets = this.decodeSecrets(viewRead.data);
      this.logger.debug(`Successfully fetched secrets`);
    } catch (error) {
      this.logger.error(
        `Error when fetching secrets from HashiCorp Vault at ${vaultUrl} on address ${secretsAddress}`,
        error,
      );
      throw error;
    }
  }

  public getSecretsFromMemory(): { [key: string]: string } {
    return this.secrets;
  }

  async onModuleInit(): Promise<void | never> {
    await this.fetchSecretsFromHashiCorpVault();
  }

  private decodeSecrets(secrets: { [key: string]: string }): {
    [key: string]: string;
  } {
    Object.keys(secrets).forEach((key) => {
      secrets[key] = decodeBase64(secrets[key]);
    });
    return secrets;
  }
}
