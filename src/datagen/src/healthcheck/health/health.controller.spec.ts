import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicatorService } from 'healthcheck/prisma-health-indicator/prisma-health-indicator.service';
import { RedisHealthIndicatorService } from 'healthcheck/redis-health-indicator/redis-health-indicator.service';
import { mock } from 'jest-mock-extended';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHttpHealth: HttpHealthIndicator;
  let mockDbHealth: PrismaHealthIndicatorService;
  let mockRedisHealth: RedisHealthIndicatorService;

  function mockHealthResult(
    success: boolean,
    key: string,
  ): HealthIndicatorResult {
    return {
      [key]: {
        status: success ? 'up' : 'down',
      },
    };
  }

  beforeEach(async () => {
    mockHttpHealth = mock<HttpHealthIndicator>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [TerminusModule],
      providers: [
        {
          provide: PrismaHealthIndicatorService,
          useValue: mock<PrismaHealthIndicatorService>(),
        },
        {
          provide: ConfigService,
          useValue: mock<ConfigService>(),
        },
        {
          provide: RedisHealthIndicatorService,
          useValue: mock<RedisHealthIndicatorService>(),
        },
      ],
    })
      .overrideProvider(HttpHealthIndicator)
      .useValue(mockHttpHealth)
      .setLogger(mock<Logger>())
      .compile();

    controller = module.get<HealthController>(HealthController);
    mockDbHealth = module.get<PrismaHealthIndicatorService>(
      PrismaHealthIndicatorService,
    );
    mockRedisHealth = module.get<RedisHealthIndicatorService>(
      RedisHealthIndicatorService,
    );
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return healthy when all are up', async () => {
    jest
      .spyOn(mockHttpHealth, 'pingCheck')
      .mockResolvedValue(mockHealthResult(true, 'ping'));

    jest
      .spyOn(mockDbHealth, 'pingCheck')
      .mockResolvedValue(mockHealthResult(true, 'prisma'));

    jest
      .spyOn(mockRedisHealth, 'pingCheck')
      .mockResolvedValue(mockHealthResult(true, 'redis'));

    const result = await controller.check();
    expect(mockHttpHealth.pingCheck).toBeCalled();
    expect(mockDbHealth.pingCheck).toBeCalled();
    expect(mockRedisHealth.pingCheck).toBeCalled();
    expect(result.status).toBe('ok');
  });

  it('should return error when one or more throw error', async () => {
    jest
      .spyOn(mockHttpHealth, 'pingCheck')
      .mockRejectedValue(
        new HealthCheckError('failed', mockHealthResult(false, 'ping')),
      );

    jest
      .spyOn(mockDbHealth, 'pingCheck')
      .mockResolvedValue(mockHealthResult(true, 'prisma'));

    jest
      .spyOn(mockRedisHealth, 'pingCheck')
      .mockResolvedValue(mockHealthResult(true, 'redis'));

    await expect(controller.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(mockHttpHealth.pingCheck).toBeCalled();
    expect(mockDbHealth.pingCheck).toBeCalled();
    expect(mockRedisHealth.pingCheck).toBeCalled();
  });
});
