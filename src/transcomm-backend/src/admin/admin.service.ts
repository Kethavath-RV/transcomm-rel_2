import { Injectable } from '@nestjs/common';
import { SecretsResponse } from 'core';
import { DatagenClient } from '../datagen-client/datagen-client';

@Injectable()
export class AdminService {
  constructor(private readonly datagenClient: DatagenClient) {}

  public async updateSecrets(): Promise<SecretsResponse> {
    try {
      const resp = await this.datagenClient.invokeUpdateSecrets();
      return resp;
    } catch (_e) {
      return {
        success: false,
        message: 'Unable to fetch latest secrets due to issues with datagen',
      };
    }
  }
}
