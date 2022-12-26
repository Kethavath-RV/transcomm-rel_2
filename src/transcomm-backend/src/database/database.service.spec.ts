import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';

const mockConfig = {
  get: jest.fn((key: string) => {
    // this is being super extra, in the case that you need multiple keys with the `get` method
    if (key === 'DATABASE_URL') {
      return 'mysql://root:Pas5word@localhost:3306/order_view';
    }
    return null;
  }),
};

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
