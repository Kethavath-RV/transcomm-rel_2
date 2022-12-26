import { Module } from '@nestjs/common';
import { SubscriptionHandlerModule } from './subscriptionHandler/subscriptionHandler.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { HyperledgerModule } from './hyperledger/hyperledger.module';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bull';
import { QueueprocessorModule } from './queueprocessor/queueprocessor.module';
import { ProducerModule } from './kafka/producer/producer.module';
import { ServicelayerModule } from './servicelayer/servicelayer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './taskservice/tasks.module';
import { BlessModule } from './bless/bless.module';
import { SecretsModule } from './secrets/secrets.module';
import { DataTransformerModule } from './dataTransformer/data-transformer.module';
import { HealthCheckModule } from './healthcheck/health-check.module';
import { validate } from './env.validation';

@Module({
  imports: [
    TasksModule,
    HyperledgerModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validate,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
    DatabaseModule,
    SubscriptionHandlerModule,
    ProducerModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('QUEUE_HOST'),
          port: configService.get<number>('QUEUE_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    QueueprocessorModule,
    ServicelayerModule,
    BlessModule,
    SecretsModule,
    DataTransformerModule,
    HealthCheckModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
