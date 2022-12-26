import { BullModule, getQueueToken } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { mock } from 'jest-mock-extended';
import { ServicelayerService } from '../servicelayer/servicelayer.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let module: TestingModule;
  let service: TasksService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'resubscribeIfUpQueue',
        }),
      ],
      providers: [
        TasksService,
        { provide: ServicelayerService, useValue: {} }
      ],
    })
      .overrideProvider(getQueueToken('resubscribeIfUpQueue'))
      .useValue(mock<Queue>())
      .setLogger(mock<Logger>())
      .compile();

    service = module.get(TasksService);
  });

  afterAll(async () => module.close());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
