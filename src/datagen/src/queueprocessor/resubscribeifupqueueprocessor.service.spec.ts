import { BullModule, getQueueToken } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, Queue } from 'bull';
import { mock } from 'jest-mock-extended';
import { ServicelayerService } from 'servicelayer/servicelayer.service';
import { ResubscribeIfUpQueueProcessorService } from './resubscribeifupqueueprocessor.service';

describe('QueueprocessorService', () => {
  let queueService: ResubscribeIfUpQueueProcessorService;
  let module: TestingModule;
  let servicelayerService: ServicelayerService;
  let mockQueue = mock<Queue>();

  const mockJob = mock<Job>();

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'resubscribeIfUpQueue',
        }),
      ],
      providers: [
        ResubscribeIfUpQueueProcessorService,
        { provide: ServicelayerService, useValue: mock<ServicelayerService>() },
      ],
    })
      .setLogger(mock<Logger>())
      .overrideProvider(getQueueToken('resubscribeIfUpQueue'))
      .useValue(mockQueue)
      .compile();

    queueService = module.get<ResubscribeIfUpQueueProcessorService>(
      ResubscribeIfUpQueueProcessorService,
    );
    servicelayerService = module.get<ServicelayerService>(ServicelayerService);
  });

  afterAll(async () => module.close());

  afterEach(async () => (mockQueue = mock<Queue>()));

  it('should be defined', () => {
    expect(queueService).toBeDefined();
  });

  it('handles resubscribeIfUp correctly - empty queue if succesfull resubscribe', async () => {
    jest
      .spyOn(servicelayerService, 'pingAndResubscribeIfUp')
      .mockImplementation();
    await queueService.handleResubscribeIfUp(mockJob);

    expect(mockQueue.empty).toBeCalledTimes(1);
    expect(mockQueue.add).toBeCalledTimes(0);
  });

  it('handles resubscribeIfUp correctly - re-queue if UNsuccesfull resubscribe', async () => {
    jest
      .spyOn(servicelayerService, 'pingAndResubscribeIfUp')
      .mockRejectedValue(new Error('error'));
    await queueService.handleResubscribeIfUp(mockJob);

    expect(mockQueue.empty).toBeCalledTimes(0);
    expect(mockQueue.add).toBeCalledTimes(1);
  });
});
