import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ConsumerService } from './consumer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ProducerModule } from 'kafka/producer/producer.module';
import { KafkaModule } from 'kafka/common/kafka.module';

@Module({
  imports: [
    KafkaModule.registerAsync(['Kafka_service'], {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'Kafka_service',
          options: {
            client: {
              clientId: 'transcomm-backend',
              brokers:
                configService.get<string>('KAFKA_BROKERS')?.split(',') ?? [],
            },
            consumer: {
              groupId:
                configService.get<string>('KAFKA_GROUP_ID', { infer: true }) ?? '',
            },
          },
        },
      ],
      inject: [ConfigService],
    }),
    DatabaseModule,
    ProducerModule,
    CqrsModule,
    ConfigModule,
  ],
  providers: [ConsumerService],
})
export class ConsumerModule {}
