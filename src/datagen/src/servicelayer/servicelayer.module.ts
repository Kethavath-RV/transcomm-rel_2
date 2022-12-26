import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { DataTransformerModule } from '../dataTransformer/data-transformer.module';
import { HyperledgerModule } from '../hyperledger/hyperledger.module';
import { ServicelayerService } from './servicelayer.service';

@Module({
  imports: [
    HyperledgerModule,
    DatabaseModule,
    ConfigModule,
    DataTransformerModule,
  ],
  providers: [ServicelayerService],
  exports: [ServicelayerService],
})
export class ServicelayerModule {}
