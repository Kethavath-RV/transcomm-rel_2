import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { Redis } from 'ioredis';
import { mock } from 'jest-mock-extended';
import { RedisHealthIndicatorService } from './redis-health-indicator.service';

describe('RedisHealthIndicatorService', () => {
  let service: RedisHealthIndicatorService;
  let mockQueue = mock<Queue>();
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'hlEventQueue',
        }),
      ],
      providers: [RedisHealthIndicatorService],
    })
      .overrideProvider(getQueueToken('hlEventQueue'))
      .useValue(mockQueue)
      .compile();

    service = module.get<RedisHealthIndicatorService>(
      RedisHealthIndicatorService,
    );
  });

  afterEach(async () => {
    mockQueue = mock<Queue>();
    jest.resetAllMocks();
  });

  afterAll(async () => module.close());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should report healthy when workers are found', async () => {
    jest.spyOn(mockQueue, 'getWorkers').mockResolvedValue([mock<Redis>()]);
    const result = await service.pingCheck('redis');
    expect(result.redis.status).toBe('up');
  });

  it('should report unhealthy when no workers are found', async () => {
    jest.spyOn(mockQueue, 'getWorkers').mockResolvedValue([]);
    const result = await service.pingCheck('redis');
    expect(result.redis.status).toBe('down');
  });
});
