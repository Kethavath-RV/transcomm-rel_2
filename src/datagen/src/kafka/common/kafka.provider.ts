import { Inject, Injectable } from '@nestjs/common';
import { KafkaModuleOption } from './interfaces';
import { KAFKA_MODULE_OPTIONS } from './kafka.constants';

@Injectable()
export class KafkaModuleOptionsProvider {
  constructor(
    @Inject(KAFKA_MODULE_OPTIONS)
    private readonly kafkaModuleOptions: KafkaModuleOption[],
  ) {}

  getOptionsByName(name: string): KafkaModuleOption['options'] {
    if (this.kafkaModuleOptions) {
      const moduleOptions = this.kafkaModuleOptions.find(
        (x) => x.name === name,
      );
      if (moduleOptions) return moduleOptions.options;
    }
    throw new Error('no kafka options');
  }
}
