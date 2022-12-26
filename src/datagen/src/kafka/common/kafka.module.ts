/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import {
  KafkaModuleOption,
  KafkaModuleOptionsAsync,
  KafkaOptionsFactory,
} from './interfaces';
import { KafkaModuleOptionsProvider } from './kafka.provider';
import { KAFKA_MODULE_OPTIONS } from './kafka.constants';

@Global()
@Module({})
export class KafkaModule {
  static register(options: KafkaModuleOption[]): DynamicModule {
    const clients = (options || []).map((item) => ({
      provide: item.name,
      useValue: new KafkaService(item.options),
    }));

    return {
      module: KafkaModule,
      providers: clients,
      exports: clients,
    };
  }

  public static registerAsync(
    consumers: string[],
    connectOptions: KafkaModuleOptionsAsync,
  ): DynamicModule {
    const clients: any[] = [];
    for (const consumer of consumers) {
      clients.push({
        provide: consumer,
        useFactory: async (
          kafkaModuleOptionsProvider: KafkaModuleOptionsProvider,
        ) => {
          return new KafkaService(
            kafkaModuleOptionsProvider.getOptionsByName(consumer),
          );
        },
        inject: [KafkaModuleOptionsProvider],
      });
    }

    const createKafkaProvider = this.createKafkaProvider(connectOptions);

    return {
      module: KafkaModule,
      imports: connectOptions.imports || [],
      providers: [
        ...createKafkaProvider,
        KafkaModuleOptionsProvider,
        ...clients,
      ],
      exports: [...clients],
    };
  }

  private static createKafkaProvider(
    options: KafkaModuleOptionsAsync,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createKafkaModuleOptionsProvider(options)];
    }
    if (options.useClass) {
      return [
        this.createKafkaModuleOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }
    console.log('Create Kafka Provider, missing options');
    return [];
  }

  private static createKafkaModuleOptionsProvider(
    options: KafkaModuleOptionsAsync,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: KAFKA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: KAFKA_MODULE_OPTIONS,
      useFactory: (optionsFactory: KafkaOptionsFactory) =>
        optionsFactory.createKafkaModuleOptions(),
      inject: [options.useExisting || options.useClass || ''],
    };
  }
}
