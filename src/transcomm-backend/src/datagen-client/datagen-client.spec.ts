import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatagenClient } from './datagen-client';

describe('DatagenClient', () => {
  let service: DatagenClient;

  beforeEach(async () => {
    const mockConfig = {
      get: jest.fn(() => {
        return null;
      }),
    };

    const mockHttpService = {
      get: jest.fn(() => {
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatagenClient,
        { provide: ConfigService, useValue: mockConfig },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<DatagenClient>(DatagenClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('BaseDatagenClient', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
