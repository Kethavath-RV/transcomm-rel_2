import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaModule } from 'kafka/common/kafka.module';
import { ProducerService } from './producer.service';

@Module({
  imports: [
    KafkaModule.registerAsync(['Kafka_service'], {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'Kafka_service',
          options: {
            client: {
              clientId: 'datagen',
              brokers:
                configService.get<string>('KAFKA_BROKERS', { infer: true })?.split(',') ?? [],
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
  ],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
