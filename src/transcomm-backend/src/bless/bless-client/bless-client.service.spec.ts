import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaMessageSetup } from 'core';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProducerService } from 'kafka/producer/producer.service';
import { BlessClientService } from './bless-client.service';
import { mockConfig } from './__mocks__/configService.mock';

describe('BlessClientService', () => {
  let service: BlessClientService;
  let kafkaService: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlessClientService,
        {
          provide: ConfigService,
          useValue: mockConfig(),
        },
        {
          provide: ProducerService,
          useValue: Mock<ProducerService>(),
        },
      ],
    }).compile();

    service = module.get<BlessClientService>(BlessClientService);
    kafkaService = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should post message', async () => {
    const payloadExample: KafkaMessageSetup = {
      data: 'test',
      ecomBusinessCode: 'test',
      authorizationId: 'test',
      eventType: 'test',
      invoiceNumber: 'test',
      orderNumber: 'test',
      txnId: 'test',
    };
    await service.postError(payloadExample);
    expect(kafkaService.post).toBeCalled();
  });
});
