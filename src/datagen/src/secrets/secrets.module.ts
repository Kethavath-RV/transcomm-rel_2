import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestVaultModule } from 'nest-vault';
import { SecretsController } from './secrets.controller';
import { SecretsService } from './secrets.service';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    NestVaultModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          baseUrl:
            configService.get('HASHICORP_VAULT_URL') ??
            'http://mock_hashicorp_vault:8200/v1',
          https: false,
          timeout: 5000,
        };
      },
    }),
  ],
  providers: [SecretsService],
  controllers: [SecretsController],
  exports: [SecretsService],
})
export class SecretsModule {}
