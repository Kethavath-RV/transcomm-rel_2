import { Test, TestingModule } from '@nestjs/testing';
import { HyperledgerEventsController } from './hl-events.controller';
import { mock } from 'jest-mock-extended';
import { Logger } from '@nestjs/common';
import { HyperledgerEventPayload } from 'core';
import { HyperledgerEventsHandlerService } from 'hyperledger/hl-events-handler/hl-events-handler.service';
import { ContractHyperledgerEventDto } from 'hyperledger/dto/contracthyperledgerEvent.dto';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { mockConfig } from './__mocks__/configService.mock';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let hlController: HyperledgerEventsController;
  let module: TestingModule;
  let mockQueue = mock<Queue>();

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'hlEventQueue',
        }),
      ],
      controllers: [HyperledgerEventsController],
      providers: [
        {
          provide: HyperledgerEventsHandlerService,
          useValue: mock<HyperledgerEventsHandlerService>(),
        },
        {
          provide: ConfigService,
          useValue: mockConfig(),
        },
      ],
    })
      .overrideProvider(getQueueToken('hlEventQueue'))
      .useValue(mockQueue)
      .setLogger(mock<Logger>())
      .compile();

    hlController = module.get<HyperledgerEventsController>(
      HyperledgerEventsController,
    );
  });

  afterEach(async () => {
    mockQueue = mock<Queue>();
    jest.resetAllMocks();
  });

  describe('setup', () => {
    it('should be defined"', () => {
      expect(hlController).toBeDefined();
    });

    it('should accept contract requests - contract status change', async () => {
      const hlPayload: HyperledgerEventPayload = {
        eventName: 'test',
        events: [
          {
            Collection: 'test',
            Key: 'test',
          },
        ],
        additionalData: [],
      };

      const contractEvent: ContractHyperledgerEventDto = {
        block: '1',
        eventName: 'DECLARATION_STATUS_CHANGE',
        chainCodeId: 'test',
        payload: JSON.stringify(hlPayload),
        txId: 'test',
      };

      hlController.processContractHyperledgerEvent(contractEvent);
      expect(mockQueue.add).toBeCalled();
    });

    it('should not process if payloads empty - contract status change', async () => {
      const contractEvent: ContractHyperledgerEventDto = {
        block: '1',
        eventName: 'DECLARATION_STATUS_CHANGE',
        chainCodeId: 'test',
        payload: JSON.stringify(''),
        txId: 'test',
      };

      hlController.processContractHyperledgerEvent(contractEvent);
    });
  });
});
