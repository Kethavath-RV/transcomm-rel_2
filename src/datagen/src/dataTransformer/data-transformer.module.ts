import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlessModule } from '../bless/bless.module';
import { SecretsModule } from '../secrets/secrets.module';
import { DataTransformerService } from './data-transformer.service';

@Module({
  imports: [SecretsModule, ConfigModule.forRoot({}), BlessModule],
  providers: [DataTransformerService],
  exports: [DataTransformerService],
})
export class DataTransformerModule {}
