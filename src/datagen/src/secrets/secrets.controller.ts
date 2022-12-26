import { Controller, HttpCode, Post } from '@nestjs/common';
import { SecretsResponse } from 'core';
import { SecretsService } from './secrets.service';

@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @HttpCode(200)
  @Post('update')
  public async updateSecrets(): Promise<SecretsResponse> {
    try {
      await this.secretsService.fetchSecretsFromHashiCorpVault();
      return {
        success: true,
        message: 'Datagen has successfully fetched latest secrets from vault',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to fetch latest secrets due to issues with vault',
      };
    }
  }
}
