import { Logger } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicatorService } from 'health-check/prisma-health-indicator/prisma-health-indicator.service';
import { mock } from 'jest-mock-extended';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [TerminusModule],
      providers: [
        {
          provide: PrismaHealthIndicatorService,
          useValue: mock<PrismaHealthIndicatorService>(),
        },
      ],
    })
      .setLogger(mock<Logger>())
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
