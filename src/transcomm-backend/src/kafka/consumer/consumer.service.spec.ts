import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { KafkaService } from 'kafka/common/kafka.service';
import { BusinessMessageModelDto } from 'kafka/common/validation/businessMessageModelSchema';
import { PickupMovementsMessageModelDto } from 'kafka/common/validation/pickupMovementMessageModelDto';
import { ProducerService } from 'kafka/producer/producer.service';
import {
  mockDetailMovementFromKafka,
  mockMasterMovementFromKafka,
  mockPickupFile,
  mockSubmitOrder,
} from 'models/mocks.models';
import { ConsumerService } from './consumer.service';
const encodeBase64 = require('btoa');

describe('Kafka consumer', () => {
  let commandBus: CommandBus;
  let kafkaProducerService: ProducerService;
  let consumer: ConsumerService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Provide a logger wihout output
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        {
          provide: CommandBus,
          useValue: mock<CommandBus>(),
        },
        {
          provide: ConfigService,
          useValue: mock<ConfigService>(),
        },
        {
          provide: ProducerService,
          useValue: mock<ProducerService>(),
        },
        {
          provide: 'Kafka_service',
          useValue: mock<KafkaService>(),
        },
      ],
    }).compile();
    consumer = module.get<ConsumerService>(ConsumerService);
    kafkaProducerService = module.get<ProducerService>(ProducerService);
    commandBus = module.get<CommandBus>(CommandBus);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  // Tests
  it('can consume new final order', async () => {
    const messageType = 'TC_DHLE_CORD';
    const message = new BusinessMessageModelDto();
    jest.spyOn(configService, 'get').mockReturnValue(messageType);
    message.transformedMessage = encodeBase64(JSON.stringify(mockSubmitOrder));
    message.msgType = messageType;
    await consumer.incomingCustomsMessage(
      message,
      { MESSAGE_CATEGORY: 'BUSINESS' },
      '',
      new Date().toDateString(),
    );
    expect(commandBus.execute).toBeCalledTimes(2);
    expect(kafkaProducerService.postBlessAck).toBeCalled();
  });

  it('can consume pickup file', async () => {
    const messageType = 'TC_DHLE_CUR_STA';
    const mockPickup = new PickupMovementsMessageModelDto();
    mockPickup.messages = encodeBase64(JSON.stringify([mockPickupFile]));
    jest.spyOn(configService, 'get').mockImplementation((x) => {
      if (x === 'BLESS_NEW_PICKUP_MESSAGE_TYPE') return messageType;
    });
    mockPickup.msgType = messageType;
    await consumer.incomingPickupFileOrMovement(
      mockPickup,
      { MESSAGE_CATEGORY: 'BUSINESS' },
      '',
      new Date().toDateString(),
    );
    expect(commandBus.execute).toBeCalledTimes(2);
  });

  it('can consume master movement', async () => {
    const messageType = 'TC_DHLE_MANF';
    const mockMessage = new PickupMovementsMessageModelDto();
    mockMessage.messages = encodeBase64(
      JSON.stringify([mockMasterMovementFromKafka]),
    );
    jest.spyOn(configService, 'get').mockImplementation((x) => {
      if (x === 'BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE') return messageType;
    });
    mockMessage.msgType = messageType;
    await consumer.incomingPickupFileOrMovement(
      mockMessage,
      { MESSAGE_CATEGORY: 'BUSINESS' },
      '',
      new Date().toDateString(),
    );
    expect(commandBus.execute).toBeCalledTimes(2);
  });

  it('can consume detail movement', async () => {
    const messageType = 'TC_DHLE_HAWB';
    const mockMessage = new PickupMovementsMessageModelDto();
    mockMessage.messages = encodeBase64(
      JSON.stringify(mockDetailMovementFromKafka),
    );
    jest.spyOn(configService, 'get').mockImplementation((x) => {
      if (x === 'BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE') return messageType;
    });
    mockMessage.msgType = messageType;
    await consumer.incomingPickupFileOrMovement(
      mockMessage,
      { MESSAGE_CATEGORY: 'BUSINESS' },
      '',
      new Date().toDateString(),
    );
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
