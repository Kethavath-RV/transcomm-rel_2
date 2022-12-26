import { BullModule, getQueueToken } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EventStatus } from '@prisma/client';
import { mockConfig } from 'bless/bless-client/__mocks__/configService.mock';
import { Queue } from 'bull';
import { EventPayload } from 'core';
import { HyperledgerEventsService } from 'database/hyperledger-events.service';
import { HyperledgerEventNames } from 'hyperledger/constants/hyperledger-events';
import { mock } from 'jest-mock-extended';
import { HyperledgerEventsHandlerService } from './hl-events-handler.service';

describe('HlEventsHandlerService', () => {
  let module: TestingModule;
  let service: HyperledgerEventsHandlerService;
  let hyperledgerEventService: HyperledgerEventsService;
  let mockQueue = mock<Queue>();

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'dataqueryQueue',
        }),
      ],
      providers: [
        HyperledgerEventsHandlerService,
        {
          provide: HyperledgerEventsService,
          useValue: mock<HyperledgerEventsService>(),
        },
        {
          provide: ConfigService,
          useValue: mockConfig(),
        },
      ],
    })
      .overrideProvider(getQueueToken('dataqueryQueue'))
      .useValue(mockQueue)
      .setLogger(mock<Logger>())
      .compile();

    service = module.get<HyperledgerEventsHandlerService>(
      HyperledgerEventsHandlerService,
    );
    hyperledgerEventService = module.get<HyperledgerEventsService>(
      HyperledgerEventsService,
    );
  });

  afterAll(async () => module.close());

  afterEach(async () => {
    mockQueue = mock<Queue>();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('handles a declaration status change', async () => {
    const collection = 'documenttracking';
    const key = 'random';
    const payloads: EventPayload[] = [{ Collection: collection, Key: key }];
    jest
      .spyOn(hyperledgerEventService, 'performEventKeyLookup')
      .mockResolvedValue({
        key,
        collection,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderNumber: 'random',
        invoiceNumber: 'random',
        ecomCode: 'random',
      });

    await service.contractStatusChange(
      HyperledgerEventNames.declaration,
      payloads,
      'test',
      '5',
    );
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledTimes(1);
    expect(mockQueue.add).toBeCalledTimes(1);
  });

  it('handles multiple declaration status change', async () => {
    const collection = 'documenttracking';
    const key = 'random';
    const payloads: EventPayload[] = [
      { Collection: collection, Key: key },
      { Collection: collection, Key: key },
    ];
    jest
      .spyOn(hyperledgerEventService, 'performEventKeyLookup')
      .mockResolvedValue({
        key,
        collection,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderNumber: 'random',
        invoiceNumber: 'random',
        ecomCode: 'random',
      });

    await service.contractStatusChange(
      HyperledgerEventNames.declaration,
      payloads,
      'test',
      '5',
    );
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledTimes(
      payloads.length,
    );
    expect(mockQueue.add).toBeCalledTimes(payloads.length);
  });

  it('handles not found status change', async () => {
    const collection = 'wrong';
    const key = 'random';
    const payloads: EventPayload[] = [
      { Collection: collection, Key: key },
      { Collection: collection, Key: key },
    ];
    jest
      .spyOn(hyperledgerEventService, 'performEventKeyLookup')
      .mockResolvedValue(null);

    await service.contractStatusChange(
      HyperledgerEventNames.declaration,
      payloads,
      'test',
      '5',
    );
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledWith(
      expect.objectContaining({ status: EventStatus.IGNORE, blockNumber: 5 }),
    );
    expect(mockQueue.add).not.toBeCalled();
  });

  it('handles empty status change', async () => {
    const payloads: EventPayload[] = [];
    jest
      .spyOn(hyperledgerEventService, 'performEventKeyLookup')
      .mockResolvedValue(null);

    await service.contractStatusChange(
      HyperledgerEventNames.declaration,
      payloads,
      'test',
      '5',
    );
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledWith(
      expect.objectContaining({ status: EventStatus.IGNORE, blockNumber: 5 }),
    );
    expect(mockQueue.add).not.toBeCalled();
  });

  it('handles chain code event correctly', async () => {
    const collection = 'documenttracking';
    const key = 'random';
    const payloads: EventPayload[] = [{ Collection: collection, Key: key }];
    jest.spyOn(hyperledgerEventService, 'getTxnId').mockResolvedValue({
      txnId: 'test',
      createdAt: new Date(),
      invoiceNumber: 'test',
      orderNumber: 'test',
      ecomCode: '',
      eventType: 'test',
      updatedAt: new Date(),
    });

    await service.chainCodeEventHandler(
      HyperledgerEventNames.declaration,
      payloads,
      'test',
      '5',
    );
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledTimes(1);
    expect(hyperledgerEventService.createEventKeyLookup).toBeCalledTimes(1);
    expect(mockQueue.add).toBeCalledTimes(1);
  });

  it('handles chain code tx not found correctly', async () => {
    const collection = 'documenttracking';
    const key = 'random';
    const payloads: EventPayload[] = [{ Collection: collection, Key: key }];
    jest.spyOn(hyperledgerEventService, 'getTxnId').mockResolvedValue(null);

    await service.chainCodeEventHandler('test', payloads, 'test', '5');
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledWith(
      expect.objectContaining({ status: EventStatus.IGNORE, blockNumber: 5 }),
    );
    expect(hyperledgerEventService.createEventKeyLookup).not.toBeCalled();
    expect(mockQueue.add).not.toBeCalled();
  });

  it('handles chain code wrong collection correctly', async () => {
    const collection = 'wrong';
    const key = 'random';
    const payloads: EventPayload[] = [{ Collection: collection, Key: key }];
    jest.spyOn(hyperledgerEventService, 'getTxnId').mockResolvedValue({
      txnId: 'test',
      createdAt: new Date(),
      invoiceNumber: 'test',
      orderNumber: 'test',
      ecomCode: '',
      eventType: 'test',
      updatedAt: new Date(),
    });

    await service.chainCodeEventHandler('test', payloads, 'test', '5');
    expect(hyperledgerEventService.createHyperledgerEvent).not.toBeCalled();
    expect(hyperledgerEventService.createEventKeyLookup).not.toBeCalled();
    expect(mockQueue.add).not.toBeCalled();
  });

  it('handles event five payloads some correct', async () => {
    jest.spyOn(hyperledgerEventService, 'getTxnId').mockResolvedValue({
      txnId: 'test',
      createdAt: new Date(),
      invoiceNumber: 'test',
      orderNumber: 'test',
      ecomCode: '',
      eventType: 'test',
      updatedAt: new Date(),
    });

    const correctPayLoads = [
      {
        Collection: 'documenttracking',
        Key: '12345',
      },
      {
        Collection: 'declaration_json_mapping',
        Key: '12345',
      },
      {
        Collection: 'claim_request',
        Key: '12345',
      },
    ];
    const incorrectPayLoads = [
      {
        Collection: 'wrong',
        Key: '12345',
      },

      {
        Collection: 'wrong',
        Key: '12345',
      },
    ];
    const mockPayload = [...correctPayLoads, ...incorrectPayLoads];

    await service.chainCodeEventHandler(
      HyperledgerEventNames.declaration,
      mockPayload,
      'test',
      '5',
    );
    expect(hyperledgerEventService.createHyperledgerEvent).toBeCalledTimes(
      correctPayLoads.length,
    );
    expect(hyperledgerEventService.createEventKeyLookup).toBeCalledTimes(
      correctPayLoads.length,
    );
    expect(mockQueue.add).toBeCalledTimes(correctPayLoads.length);
  });

  it('throws an error if the event name is not known', async () => {
    const collection = 'documenttracking';
    const key = 'random';
    const testEventName = 'should fail';
    const payloads: EventPayload[] = [{ Collection: collection, Key: key }];
    await expect(
      service.contractStatusChange(testEventName, payloads, 'test', '5'),
    ).rejects.toThrow(new Error(`Event not known ${testEventName}`));
  });
});
