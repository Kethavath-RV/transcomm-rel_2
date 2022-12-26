import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'database/database.service';
import { ViewsService } from './views.service';
import { Context, createMockContext, MockContext } from './__mocks__/prisma.mock';

describe('ViewsService', () => {
  let service: ViewsService;
  let context: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    context = createMockContext();
    ctx = context as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewsService,
        { provide: DatabaseService, useValue: ctx.prisma },
      ],
    }).compile();

    service = module.get<ViewsService>(ViewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
