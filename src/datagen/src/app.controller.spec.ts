import { Test, TestingModule } from '@nestjs/testing';
import { ServicelayerService } from './servicelayer/servicelayer.service';
import { AppController } from './app.controller';
import { Logger } from '@nestjs/common';
import { mock } from 'jest-mock-extended';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: ServicelayerService, useValue: {} }],
    })

      .setLogger(mock<Logger>())
      .compile();

    appController = app.get<AppController>(AppController);
  });

  describe('setup', () => {
    it('should be defined"', () => {
      expect(appController).toBeDefined();
    });
  });
});
