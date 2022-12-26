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
  afterEach(async () => jest.resetAllMocks());

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
    await service.post(payloadExample, 'test', 'test');
    expect(kafkaService.post).toBeCalled();
  });

  it('should switch receivers depending on event name & collection (error)', async () => {
    const expectedReceivers = 'DHL-EXP,LUXC_DXB'.split(',');
    const notExpected = 'DHL-EXP';
    const payloadExample: KafkaMessageSetup = {
      data: 'test',
      ecomBusinessCode: 'test',
      authorizationId: 'test',
      eventType: 'test',
      invoiceNumber: 'test',
      orderNumber: 'test',
      txnId: 'test',
    };

    const postSpy = jest.spyOn(kafkaService, 'post');

    await service.post(payloadExample, 'EXCEPTION', 'BUSINESS');
    const result = JSON.parse(postSpy.mock.calls[0][0]);
    expect(result).toEqual(
      expect.objectContaining({
        receivers: expect.objectContaining({
          primary: expectedReceivers,
        }),
      }),
    );

    expect(result).not.toEqual(
      expect.objectContaining({
        receivers: expect.objectContaining({
          primary: [notExpected],
        }),
      }),
    );
  });

  it('should switch receivers depending on event name & collection (non error)', async () => {
    const notExpected = 'DHL-EXP,LUXC_DXB'.split(',');
    const expectedReceivers = 'DHL-EXP';
    const payloadExample: KafkaMessageSetup = {
      data: 'test',
      ecomBusinessCode: 'test',
      authorizationId: 'test',
      eventType: 'test',
      invoiceNumber: 'test',
      orderNumber: 'test',
      txnId: 'test',
    };

    const postSpy = jest.spyOn(kafkaService, 'post');

    await service.post(payloadExample, 'example', 'example');
    const result = JSON.parse(postSpy.mock.calls[0][0]);
    expect(result).toEqual(
      expect.objectContaining({
        receivers: expect.objectContaining({
          primary: [expectedReceivers],
        }),
      }),
    );

    expect(result).not.toEqual(
      expect.objectContaining({
        receivers: expect.objectContaining({
          primary: notExpected,
        }),
      }),
    );
  });
});
