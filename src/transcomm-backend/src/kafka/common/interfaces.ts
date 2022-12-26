/* eslint-disable @typescript-eslint/no-explicit-any */
import { Deserializer, Serializer } from '@nestjs/microservices';
import {
  ConsumerConfig,
  KafkaConfig,
  ProducerConfig,
  ProducerRecord,
  Message,
  IHeaders,
} from 'kafkajs';
import { ModuleMetadata, Type } from '@nestjs/common';
export interface KafkaResponse<T = any> {
  response: T;
  key: string;
  timestamp: string;
  offset: string;
  headers?: IHeaders;
}
export interface KafkaModuleOption {
  name: string;
  options: {
    client: KafkaConfig;
    consumer: ConsumerConfig;
    producer?: ProducerConfig;
    deserializer?: Deserializer;
    serializer?: Serializer;
    consumeFromBeginning?: boolean;
    seek?: Record<string, number | 'earliest'>;
  };
}
export interface KafkaMessageObject extends Message {
  value: any | Buffer | string | null;
  key: any;
}
export interface KafkaMessageSend extends Omit<ProducerRecord, 'topic'> {
  messages: KafkaMessageObject[];
  topic?: string;
}
export interface KafkaModuleOptionsAsync
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<KafkaOptionsFactory>;
  useClass?: Type<KafkaOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<KafkaModuleOption[]> | KafkaModuleOption[];
}
export interface KafkaOptionsFactory {
  createKafkaModuleOptions():
    | Promise<KafkaModuleOption[]>
    | KafkaModuleOption[];
}
