import { HealthCheckError } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'database/database.service';
import { PrismaHealthIndicatorService } from './prisma-health-indicator.service';
import { Context, createMockContext, MockContext } from './__mocks__/prisma.mock';

describe('PrismaHealthIndicatorService', () => {
  let service: PrismaHealthIndicatorService;
  let context: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    context = createMockContext();
    ctx = context as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaHealthIndicatorService,
        { provide: DatabaseService, useValue: ctx.prisma },
      ],
    }).compile();

    service = module.get<PrismaHealthIndicatorService>(PrismaHealthIndicatorService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should report healthy when query is successful', async () => {
    context.prisma.$queryRaw.mockResolvedValue(1);
    const result = await service.pingCheck('prisma');
    expect(result.prisma.status).toBe('up');
  });

  it('should report unhealthy when query throws', async () => {
    context.prisma.$queryRaw.mockRejectedValue("error");
    await expect(service.pingCheck('prisma')).rejects.toThrow(HealthCheckError);
  });
});
