import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EventStatus, HyperledgerEvent } from '@prisma/client';
import { BlessClientService } from 'bless/bless-client/bless-client.service';
import { Job } from 'bull';
import { HyperledgerQueryResponse, HyperledgerQueryWithTxID } from 'core';
import { HyperledgerEventNames } from 'hyperledger/constants/hyperledger-events';
import { mock } from 'jest-mock-extended';
import { HyperledgerEventsService } from '../database/hyperledger-events.service';
import { HyperledgerClientService } from '../hyperledger/hyperledger-client/hyperledger-client.service';
import { DataqueryQueueProcessorService } from './dataqueryqueueprocessor.service';

describe('DataqueryQueueprocessorService', () => {
  let service: DataqueryQueueProcessorService;
  let mockHyperLedgerEventService: HyperledgerEventsService;
  let mockHyperLedgerClientService: HyperledgerClientService;
  let mockConfigService: ConfigService;
  let module: TestingModule;
  let mockBlessClient: BlessClientService;

  const mockJob = mock<Job<HyperledgerQueryWithTxID>>();

  const mockQueryResponse: HyperledgerQueryResponse = {
    message: {
      response: 'testResponse',
      data: 'testData',
    },
    error: '',
  };

  const mockHLEvent: HyperledgerEvent = {
    id: 'testId',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: EventStatus.COMPLETED,
    key: 'testKey',
    collection: 'testCollection',
    blockNumber: 0,
    invoiceNumber: '1',
    orderNumber: '1',
    ecomCode: 'testEcom',
    eventName: HyperledgerEventNames.chain,
    txId: '500',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [],
      providers: [
        DataqueryQueueProcessorService,
        {
          provide: HyperledgerClientService,
          useValue: mock<HyperledgerClientService>(),
        },
        {
          provide: HyperledgerEventsService,
          useValue: mock<HyperledgerEventsService>(),
        },
        { provide: BlessClientService, useValue: mock<BlessClientService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
      ],
    })
      .setLogger(mock<Logger>())
      .compile();

    service = module.get<DataqueryQueueProcessorService>(
      DataqueryQueueProcessorService,
    );
    mockHyperLedgerEventService = module.get<HyperledgerEventsService>(
      HyperledgerEventsService,
    );
    mockHyperLedgerClientService = module.get<HyperledgerClientService>(
      HyperledgerClientService,
    );
    mockConfigService = module.get<ConfigService>(ConfigService);
    mockBlessClient = module.get<BlessClientService>(BlessClientService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => module.close());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle dataquery jobs', () => {
    jest
      .spyOn(mockHyperLedgerClientService, 'queryOrderData')
      .mockResolvedValue(mockQueryResponse);
    jest
      .spyOn(mockHyperLedgerEventService, 'getHyperledgerEventByKey')
      .mockResolvedValue(mockHLEvent);
    jest
      .spyOn(mockHyperLedgerEventService, 'updateHyperledgerEvent')
      .mockResolvedValue(mockHLEvent);
    jest.spyOn(mockConfigService, 'get').mockReturnValue('TEST_TOPIC');

    expect(() => service.handleDataquery(mockJob)).not.toThrowError();
  });

  it('should throw an error if it cant query the data', async () => {
    jest
      .spyOn(mockHyperLedgerClientService, 'queryOrderData')
      .mockRejectedValue(new Error('query error'));
    jest
      .spyOn(mockHyperLedgerEventService, 'getHyperledgerEventByKey')
      .mockResolvedValue(mockHLEvent);
    jest
      .spyOn(mockHyperLedgerEventService, 'updateHyperledgerEvent')
      .mockResolvedValue(mockHLEvent);
    jest.spyOn(mockConfigService, 'get').mockReturnValue('TEST_TOPIC');

    await expect(service.handleDataquery(mockJob)).rejects.toThrowError(
      'query error',
    );
  });

  it('should throw an error if it cant get the hyperledger event by key', async () => {
    jest
      .spyOn(mockHyperLedgerClientService, 'queryOrderData')
      .mockResolvedValue(mockQueryResponse);
    jest
      .spyOn(mockHyperLedgerEventService, 'getHyperledgerEventByKey')
      .mockRejectedValue(new Error('hl error'));
    jest
      .spyOn(mockHyperLedgerEventService, 'updateHyperledgerEvent')
      .mockResolvedValue(mockHLEvent);
    jest.spyOn(mockConfigService, 'get').mockReturnValue('TEST_TOPIC');

    await expect(service.handleDataquery(mockJob)).rejects.toThrowError(
      'hl error',
    );
  });

  it('should throw an error if it cant post the data to kafka', async () => {
    jest
      .spyOn(mockHyperLedgerClientService, 'queryOrderData')
      .mockResolvedValue(mockQueryResponse);
    jest
      .spyOn(mockHyperLedgerEventService, 'getHyperledgerEventByKey')
      .mockResolvedValue(mockHLEvent);
    jest
      .spyOn(mockHyperLedgerEventService, 'updateHyperledgerEvent')
      .mockResolvedValue(mockHLEvent);
    jest.spyOn(mockConfigService, 'get').mockReturnValue('TEST_TOPIC');
    jest
      .spyOn(mockBlessClient, 'post')
      .mockRejectedValue(new Error('config error'));
  });
});
