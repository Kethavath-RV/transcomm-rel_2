import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, Queue } from 'bull';
import { HyperledgerEventPayload } from 'core';
import { ContractHyperledgerEventDto } from 'hyperledger/dto/contracthyperledgerEvent.dto';
import { HyperledgerEventsHandlerService } from 'hyperledger/hl-events-handler/hl-events-handler.service';
import { mock } from 'jest-mock-extended';
import { HlEventProcessorService } from './hl-event-processor.service';

describe('HlEventProcessorService', () => {
  let service: HlEventProcessorService;
  let hlHandlerService: HyperledgerEventsHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HlEventProcessorService,
        {
          provide: HyperledgerEventsHandlerService,
          useValue: mock<HyperledgerEventsHandlerService>(),
        },
      ],
    })
      .setLogger(mock<Logger>())
      .compile();

    service = module.get<HlEventProcessorService>(HlEventProcessorService);
    hlHandlerService = module.get<HyperledgerEventsHandlerService>(
      HyperledgerEventsHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should accept contract requests - contract status change', async () => {
    const hlPayload: HyperledgerEventPayload = {
      eventName: 'DECLARATION_STATUS_CHANGE',
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
      eventName: 'chainCodeEvent',
      chainCodeId: 'test',
      payload: JSON.stringify(hlPayload),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    await service.handleContractEvent(request);
    expect(hlHandlerService.chainCodeEventHandler).not.toBeCalled();
    expect(hlHandlerService.contractStatusChange).toBeCalled();
  });

  it('should accept contract requests - contract status change', async () => {
    const hlPayload: HyperledgerEventPayload = {
      eventName: 'CLAIM_STATUS_CHANGE',
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
      eventName: 'chainCodeEvent',
      chainCodeId: 'test',
      payload: JSON.stringify(hlPayload),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    await service.handleContractEvent(request);
    expect(hlHandlerService.chainCodeEventHandler).not.toBeCalled();
    expect(hlHandlerService.contractStatusChange).toBeCalled();
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
      eventName: 'chainCodeEvent',
      chainCodeId: 'test',
      payload: JSON.stringify(hlPayload),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    jest
      .spyOn(hlHandlerService, 'chainCodeEventHandler')
      .mockResolvedValue(true);

    service.handleContractEvent(request);
    expect(hlHandlerService.chainCodeEventHandler).toBeCalled();
    expect(hlHandlerService.contractStatusChange).not.toBeCalled();
  });

  it('contract chain requests - contract event txId fails skips', async () => {
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
      eventName: 'chainCodeEvent',
      chainCodeId: 'test',
      payload: JSON.stringify(hlPayload),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    jest
      .spyOn(hlHandlerService, 'chainCodeEventHandler')
      .mockResolvedValue(false);
    await service.handleContractEvent(request);
    expect(hlHandlerService.chainCodeEventHandler).toBeCalled();
    expect(hlHandlerService.contractStatusChange).not.toBeCalled();
  });

  it('when queue fails, queue is cleared and service stops', async () => {
    // const mockExit = jest.spyOn(process, 'exit').mockReturnValue({} as never);
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
      eventName: 'chainCodeEvent',
      chainCodeId: 'test',
      payload: JSON.stringify(hlPayload),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    request.queue = mock<Queue<ContractHyperledgerEventDto>>();

    jest
      .spyOn(hlHandlerService, 'chainCodeEventHandler')
      .mockImplementation(() => {
        throw new Error('uncaught');
      });
    await expect(service.handleContractEvent(request)).rejects.toThrow();
  });

  it('on queue fail event exit application', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockReturnValue({} as never);
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
      eventName: 'chainCodeEvent',
      chainCodeId: 'test',
      payload: JSON.stringify(hlPayload),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    request.queue = mock<Queue<ContractHyperledgerEventDto>>();
    await service.handleQueueError(request, new Error('test'));
    expect(mockExit).toBeCalled();
  });

  it('should not process if payloads empty - contract status change', async () => {
    const contractEvent: ContractHyperledgerEventDto = {
      block: '1',
      eventName: 'DECLARATION_STATUS_CHANGE',
      chainCodeId: 'test',
      payload: JSON.stringify(''),
      txId: 'test',
    };

    const request: Job<ContractHyperledgerEventDto> =
      mock<Job<ContractHyperledgerEventDto>>();
    request.data = contractEvent;

    await service.handleContractEvent(request);
    expect(hlHandlerService.contractStatusChange).not.toBeCalled();
    expect(hlHandlerService.chainCodeEventHandler).not.toBeCalled();
  });
});
