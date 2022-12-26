import {
  BusinessMessageModel,
  NotificationMessageModel,
  NotificationType,
  PickupMovementsMessageModel,
} from 'core';
import { KafkaMessage } from 'kafkajs';
import { Test, TestingModule } from '@nestjs/testing';
import { BusinessMessageModelDto } from '../validation/businessMessageModelSchema';
import { NotificationMessageModelDto } from '../validation/notificationMessageModelSchema';
import { PickupMovementsMessageModelDto } from '../validation/pickupMovementMessageModelDto';
import { KafkaResponseDeserializer } from './kafka-response.deserializer';
import { Logger } from '@nestjs/common';
import Mock from 'jest-mock-extended/lib/Mock';

let kafkaResponseDeserializer: KafkaResponseDeserializer;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [KafkaResponseDeserializer],
  }).compile();
  module.useLogger(Mock<Logger>());

  kafkaResponseDeserializer = module.get<KafkaResponseDeserializer>(
    KafkaResponseDeserializer,
  );
});

describe('kafka deserializer', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(kafkaResponseDeserializer).toBeDefined();
  });

  it('can deserialize a business message class', async () => {
    const businessMessage = new BusinessMessageModelDto();
    businessMessage.id = 'id';
    businessMessage.msgType = 'test';
    businessMessage.transformedMessage = 'message';
    const headers = {
      MESSAGE_CATEGORY: 'BUSINESS',
    };

    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(businessMessage)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
      headers: headers,
    };

    const result = kafkaResponseDeserializer.deserialize(message);
    expect(result.response).toBeInstanceOf(BusinessMessageModelDto);
  });

  it('can deserialize a business message object', async () => {
    const businessMessage: BusinessMessageModel = {
      id: 'id',
      msgType: 'type',
      sender: '',
      receivers: new Map(),
      issueTime: 0,
      trailKey: '',
      trailCreatedOn: 0,
      checkpointStatus: '',
      checkpointAttributes: new Map(),
      attachments: undefined,
      transformedMessage: 'filled',
      sequenceNumber: '',
      f1: '',
      f2: '',
      postProcessingRequired: false,
      token: '',
      payloadCreatedOn: 0,
    };
    const headers = {
      MESSAGE_CATEGORY: 'BUSINESS',
    };

    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(businessMessage)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
      headers: headers,
    };

    const result = kafkaResponseDeserializer.deserialize(message);
    expect(result.response).toBeInstanceOf(BusinessMessageModelDto);
  });

  it('cannot deserialize a business message object wrong struct', async () => {
    const businessMessage = {
      cat: 'im wrong',
    };

    const headers = {
      MESSAGE_CATEGORY: 'BUSINESS',
    };

    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(businessMessage)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
      headers: headers,
    };

    expect(() => kafkaResponseDeserializer.deserialize(message)).toThrow();
  });

  it('can process pickup movement file class', async () => {
    const pickupMessage = new PickupMovementsMessageModelDto();
    pickupMessage.messages = 'message';
    pickupMessage.msgType = 'test';
    const expectedFormat = {
      ...pickupMessage,
    };

    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(expectedFormat)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
    };

    const result = kafkaResponseDeserializer.deserialize(message);
    expect(result.response).toBeInstanceOf(PickupMovementsMessageModelDto);
  });

  it('can process pickup movement file object', async () => {
    const pickupMessage: PickupMovementsMessageModel = {
      msgType: 'test',
      sender: '',
      uuid: '',
      msgFilePath: '',
      messages: 'message',
    };
    const expectedFormat = {
      ...pickupMessage,
    };

    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(expectedFormat)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
    };

    const result = kafkaResponseDeserializer.deserialize(message);
    expect(result.response).toBeInstanceOf(PickupMovementsMessageModelDto);
  });

  it('cannot deserialize a pickup message object wrong struct', async () => {
    const pickupMessage = {
      cat: 'im wrong',
    };

    const expectedFormat = {
      ...pickupMessage,
    };

    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(expectedFormat)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
    };

    expect(() => kafkaResponseDeserializer.deserialize(message)).toThrow();
  });

  it('can process notification message class', async () => {
    const pickupMessage = new NotificationMessageModelDto();
    pickupMessage.id = '21231';
    pickupMessage.type = NotificationType.delete;

    const headers = {
      MESSAGE_CATEGORY: 'NOTIFICATION',
    };
    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(pickupMessage)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
      headers,
    };

    const result = kafkaResponseDeserializer.deserialize(message);
    expect(result.response).toBeInstanceOf(NotificationMessageModelDto);
  });

  it('can process notification message object', async () => {
    const pickupMessage: NotificationMessageModel = {
      id: '123142',
      type: NotificationType.delete,
      content: '',
    };

    const headers = {
      MESSAGE_CATEGORY: 'NOTIFICATION',
    };
    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(pickupMessage)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
      headers,
    };

    const result = kafkaResponseDeserializer.deserialize(message);
    expect(result.response).toBeInstanceOf(NotificationMessageModelDto);
  });

  it('cannot process notification message object', async () => {
    const pickupMessage = {
      cat: 'im wrong',
    };
    const headers = {
      MESSAGE_CATEGORY: 'NOTIFICATION',
    };
    const message: KafkaMessage = {
      key: Buffer.from(JSON.stringify('test')),
      value: Buffer.from(JSON.stringify(pickupMessage)),
      timestamp: '',
      size: 0,
      attributes: 0,
      offset: '',
      headers,
    };
    expect(() => kafkaResponseDeserializer.deserialize(message)).toThrow();
  });
});
